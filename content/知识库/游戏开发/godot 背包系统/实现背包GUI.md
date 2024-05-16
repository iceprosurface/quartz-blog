---
title: 实现背包GUI
date: 2024-05-16T23:08:00+08:00
updated: 2024-05-17T00:52:01+08:00
permalink: /godot/bag-system/gui/
tags:
  - 游戏开发
ccby: true
---
在 [[如何设计一个背包的控制逻辑]] 中我们实现了背包的所有处理逻辑下面需要绑定 ui 了，ui 上逻辑就比较简单了，我们需要简单的做一个数据流程图去思考一下怎么实现数据的流转。 

![背包 gui 逻辑](https://cdn.iceprosurface.com/upload/md/202405162336601.png)

我选择将 ui 层分为 4 块功能：

+ BagContainer 这个是需要被导出为自定义 node 的节点，用来标记 bag 显示在哪里，随后 bag 会自动显示在目标位置，并适配其宽高
+ BagInnerContainer 处理具体的背包逻辑
+ ItemSlot 用来实现显示 ItemSlot 的功能
+ MouseSlot 用来显示被鼠标拿住的物品，这个阶段先不实现

> [!note]  注意 BagContainer 和 BagInnerContainer 本身没有较大的界限，我个人比较喜欢分开但是实际上，是实现在一起会更方便一点。

# 背包功能逻辑

![背包](https://cdn.iceprosurface.com/upload/md/202405162337200.png)

然后我们就可以简单的画出上面这个图，对于整个 GUI 组件而言，对于 BagContainer 并不关心里面存放的内容，他只需要设定背包的大小（从 godot 编辑器里面拖拽），设定行、列，随后设置一个全局唯一的 BagName 即可。

BagInnerContainer 是一个活比较重的组件，他需要初始化 ItemSlot，设定宽高等等。

最后是 ItemSlot 他是一个核心组件，用于显示背包的数量和图标，当然未来还有拖拽事件，所以还需要绑定一些复杂的事件。

## 扩展实现 BagResourceManager

我们使用 [[../../编程/单例模式|单例]] 来实现，[[../Godot autoloads以及 csharp 单例模式|之前]] 我们也写过类似的方案：

```csharp  
public partial class BagResourceManager  
{  
    BagResourceManager()  
    {   
	    // 方便做测试，这里的注册功能应该通过 csv 或是 excel 或是 sqlite 的方式自动读取
	    Init();  
    }  
    private static BagResourceManager _bagResourceManager;  
    public static BagResourceManager Instance => _bagResourceManager ??= new BagResourceManager();  
    public BagItemResource GetItem(string name) => Items[name];  
  
    public readonly Dictionary<string, BagItemResource> Items = new();  
	// 给一个 init 函数方便做测试
    public void Init()  
    {        
		Items.Add("banana",
			new BagItemResource  
			{  
                Name = "banana", Icon = "res://assets/pictures/banana.png", MaxCount = 100  
			});  
    }
}
```

## 扩展 BagItem

为了方便使用，我们在 BagItem 中扩展一个字段用来获取他对应的 resource 数据, 他还可以帮助我们获取目标的 Texture，可能算一种变异的 [[../../编程/享元模式|享元模式]] 

```csharp
public class BagItem  
{  
    // ...略去内容
    // 扩展了一个对外方法
    public BagItemResource Resource => BagResourceManager.Instance.GetItem(Name);  
    // ...略去内容
}
```

> [!warning] 实际上这可能并不是一个好的选择，因为当你可以获得 BagItem 的时候，你已经可以通过 Name 变相的从 BagResourceManager 中获取 Item 的元信息了，这样做可以完全的分离相互间的耦合性。 

## 实现 ItemSlot

我们从下层逐渐向上实现是比较好的组织方式，首先 ItemSlot 的组织架构大致如下： 

![node-tree例子](https://cdn.iceprosurface.com/upload/md/202405162335179.png)

这里我只修改了CountLabel 的名字其余都一致样子大致是这样的,会有一个默认的 margin。

![Pasted image 20240516233639](https://cdn.iceprosurface.com/upload/md/202405162336602.png)

下面我需要编写对应的代码：

```csharp
  
public partial class ItemSlot : Control  
{  
    [Export] public Label CountLabel;  
    [Export] public TextureRect Icon { get; set; }  
  
    private int _x;  
    private int _y;  
    private string _bagName;  
	// 方便上级初始化的时候添加数据，我还没找到合适的 constructor 方式创建。
    public void AddItem(string bagName, int x, int y)  
    {        
	    _x = x;
        _y = y;
        _bagName = bagName;  
    }

    // 方便后续使用
    private BagItem Item => BagController.Instance.GetBagItem(_bagName, _x, _y);  
  
    private void ClearRender()  
    {        
	    Icon.Texture = null;  
        CountLabel.Text = "";  
    }  

    public override void _Process(double delta)  
    {        
	    // 保底策略，当 Item 不可用的时候需要清除基础的渲染
	    if (Item.IsEmpty || Item is null)  
        {            
	        ClearRender();  
            return;  
        }  
        CountLabel.Text = Item.Count.ToString();  
        Icon.Texture = Item.Resource.Texture;  
    }
}
```

这样就完成 ItemSlot 的基本逻辑，下面要通过 BagInnerContainer 创建 ItemSlot

## BagInnerContainer

BagInnerContainer 他的 UI 和代码逻辑都很简单的，具体的组件只有三个用来控制宽度的外层、滚动的 scroll container、还有 Grid：

![Pasted image 20240517000350](https://cdn.iceprosurface.com/upload/md/202405170038018.png)

我们只需要简单的 scroll container 设置为下面这样就可以了，这样当高度不够的时候他就会转换为滚动来显示 ui：

![Pasted image 20240517000448](https://cdn.iceprosurface.com/upload/md/202405170038019.png)


下面我们要开始编写代码部分：

```csharp  
public partial class BagInnerContainer : Control  
{  
    public string BagName;  
    [Export] public GridContainer Grid;  
    public BagContainer Parent;    
  
    public void InitBagGrid()  
    {        
	    // 获取当前 bag 的信息，并向 grid 里面添加对应的格子  
        if (BagController.Instance.Bags.ContainsKey(BagName))  
        {            
	        var bag = BagController.Instance.Bags[BagName];  
            Grid.Columns = bag.ColumnCount;  
            // 计算宽度  
            var width = Size.X;  
            // 还需要减去边距  
            // 还需要减去 scroll 宽度  
            var cellWidth = width / bag.ColumnCount;  
            var pack = GD.Load<PackedScene>("res://<path to ItemSlot>");  
            for (int i = 0; i < bag.ColumnCount; i++)  
            {                
	            for (int j = 0; j < bag.RowCount; j++)  
                {                    
	                // 计算宽度  
                    var cellHeight = cellWidth;  
                    var cell = pack.Instantiate<ItemSlot>();  
                    cell.Name = $"ItemSlot_{i}_{j}";  
                    cell.CustomMinimumSize = new Vector2(cellWidth, cellHeight);  
                    cell.AddItem(BagName, i, j);  
                    Grid.AddChild(cell);  
                }            
			}        
		}    
	}  
}
```

我们需要对外暴露一个 InitBagGrid 的方法，并向内添加对应的格子这里实现上并不难做，初始化以后调用 AddItem 即可在内部已经实现了。

## BagContainer 

BagContainer 组件虽然逻辑复杂一点，但是组件上反而是更简单了，他只有用来标记大小的 ColorRect 组件。

![Pasted image 20240517001120](https://cdn.iceprosurface.com/upload/md/202405170038020.png)

随便拖拽一个大小即可。

下面是代码部分：

```csharp
public partial class BagContainer : Control  
{  
    /// <summary>  
    /// 背包名称，全局唯一  
    /// </summary>  
    [Export] public string BagName = "Default";  
    [Export] public int ColumnCount = 5;  
    [Export] public int RowCount = 40;  
    /// <summary>  
    /// 是否在退出时从控制器中移除，用来实现一次性的背包或者容器
    /// </summary>  
    [Export] public bool ExitFreeFromController = true;  
    /// <summary>  
    /// 是否在 Ready 时初始化背包  
    /// </summary>  
    [Export] public bool InitOnReady;  
  
    private BagInnerContainer _innerContainer;  
  
    private const string BAG_CONTAINER_PATH = "<path to BagInnerContainer>";  
  
    public async void InitBag()  
    {        
	    // 创建背包  
        BagController.Instance.AddBag(BagName, ColumnCount, RowCount);  
        var bagInnerContainerPack = GD.Load<PackedScene>(BAG_CONTAINER_PATH);  
        _innerContainer = bagInnerContainerPack.Instantiate<BagInnerContainer>();  
        _innerContainer.BagName = BagName;  
        _innerContainer.Parent = this;  
        // 延迟确保 size 正确
        await ToSignal(GetTree(), SceneTree.SignalName.ProcessFrame);  
        _innerContainer.Size = Size;  
        AddChild(_innerContainer);  
        _innerContainer.InitBagGrid();  
    }  
    public override void _Ready()  
    {        
	    if (InitOnReady)  
        {
	        // 如果勾选了自动初始化就直接初始化，如果没有说明需要手动初始化
	        InitBag();  
        }    
	}  
    public override void _ExitTree()  
    {        
		if (ExitFreeFromController)  
		{                
			BagController.Instance.RemoveBag(BagName);  
		}        
	}  
    public override void _Process(double delta)  
    {        
	    if (_innerContainer is not null)  
        {            
	        _innerContainer.GlobalPosition = GlobalPosition;  
        }    
	}
}
```

## 实验一下

下面我们简单的建一个背包实验一下：

![Pasted image 20240517001648](https://cdn.iceprosurface.com/upload/md/202405170038021.png)

```csharp
public partial class BagNode : Control  
{  
    [Export] public string BagName = "Test";  
    [Export] public Label BagNameLabel;  
    [Export] public BagContainer BagContainer;  
  
    public void OnClose()  
    {        
	    Visible = false;  
    }  
    public override void _Ready()  
    {        
	    BagNameLabel.Text = BagName;  
        BagContainer.BagName = BagName;  
        BagContainer.InitBag();  
        BagController.Instance.AddItemToBag("Test", "banana", 10);
    }
}
```

效果还不错，下面需要实现拖拽系统。

