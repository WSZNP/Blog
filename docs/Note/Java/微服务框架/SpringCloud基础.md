之前我们学习的项目一是单体项目，可以满足小型项目或传统项目的开发。而在互联网时代，越来越多的一线互联网公司都在使用微服务技术。

从搜索指数来看，国内从自2016年底开始，微服务热度突然暴涨：

![image-20231229155319291](/assets/images/Java/微服务框架/SpringCloud基础/image-20231229155319291.png)

那么：

- 到底什么是微服务？
- 企业该不该引入微服务？
- 微服务技术该如何在企业落地？

接下来几天，我们就一起来揭开它的神秘面纱。

计划是这样的，课前资料中给大家准备了一个**单体**的电商小项目：黑马商城，我们会基于这个单体项目来演示从单体架构到微服务架构的演变过程、分析其中存在的问题，以及微服务技术是如何解决这些问题的。

你会发现每一个微服务技术都是在解决服务化过程中产生的问题，你对于每一个微服务技术具体的应用场景和使用方式都会有更深层次的理解。

今天作为课程的第一天，我们要完成下面的内容：

- 知道单体架构的特点
- 知道微服务架构的特点
- 学会拆分微服务
- 会使用Nacos实现服务治理
- 会使用OpenFeign实现远程调用



# 0、环境准备

在 资料 中给大家提供了黑马商城项目的资料，我们需要先导入这个单体项目。不过需要注意的是，本篇及后续的微服务学习都是基于Centos7系统下的Docker部署，因此你必须做好一些准备：

- Centos7的环境及一个好用的SSH客户端
- 安装好Docker
- 会使用Docker

> 如果没有Linux环境也不想再安装部署Docker；那就直接使用上课老师提供的虚拟机镜像。
>
> **注意**：
>
> 如果是学习过上面Docker课程的同学，虚拟机中已经有了黑马商城项目及MySQL数据库了，不过为了跟其他同学保持一致，可以先将整个项目移除。使用下面的命令：
>
> cd /root
>
> docker compose down

## 0.1、安装MySQL

在 `资料/mysql` 中提供了MySQL在docker的安装情况下的初始化脚本、配置等。将该目录直接复制到 `/root` 目录下。如果 `/root` 已经存在则先删除再上传。

![image-20231229161840399](/assets/images/Java/微服务框架/SpringCloud基础/image-20231229161840399.png)

创建docker 网络及运行MySQL容器：

```sh
# 创建网络
docker network create hm-net

# 创建MySQL容器
docker run -d \
  --name mysql \
  -p 3306:3306 \
  -e TZ=Asia/Shanghai \
  -e MYSQL_ROOT_PASSWORD=root \
  -v /root/mysql/data:/var/lib/mysql \
  -v /root/mysql/conf:/etc/mysql/conf.d \
  -v /root/mysql/init:/docker-entrypoint-initdb.d \
  --network hm-net\
  mysql
```



执行之后；通过命令查看mysql容器：

```sh
docker ps
```

![image-20231229162644346](/assets/images/Java/微服务框架/SpringCloud基础/image-20231229162644346.png)



此时，如果我们使用MySQL的客户端工具连接MySQL，应该能发现已经创建了黑马商城所需要的表：

![image-20231229162846989](/assets/images/Java/微服务框架/SpringCloud基础/image-20231229162846989.png)

## 0.2、后端

将 `资料\hmall` 文件夹拷贝到你的工作空间，然后使用IDEA打开：项目结构如下：

![image-20231229163822633](/assets/images/Java/微服务框架/SpringCloud基础/image-20231229163822633.png)

按下`ALT` + `8`键打开services窗口，新增一个启动项：

![image-20231229164202928](/assets/images/Java/微服务框架/SpringCloud基础/image-20231229164202928.png)

在弹出窗口中鼠标向下滚动，找到`Spring Boot`:

![image-20231229164248074](/assets/images/Java/微服务框架/SpringCloud基础/image-20231229164248074.png)

上述点击之后，则会出现如下界面：

![image-20231229164502781](/assets/images/Java/微服务框架/SpringCloud基础/image-20231229164502781.png)

点击对应按钮，即可实现运行或DEBUG运行。但是在运行之前，再做个简单配置：在`HMallApplication`上点击鼠标右键，会弹出窗口，然后选择`Edit Configuration`：

![image-20231229164644598](/assets/images/Java/微服务框架/SpringCloud基础/image-20231229164644598.png)

在弹出窗口中配置SpringBoot的启动环境为 `local`：

![image-20231229164738956](/assets/images/Java/微服务框架/SpringCloud基础/image-20231229164738956.png)



修改hmall项目中的 `application-local.yml` 文件中；数据库的连接信息。然后启动项目访问测试：

http://locahost:8080/hi

![image-20231229165521828](/assets/images/Java/微服务框架/SpringCloud基础/image-20231229165521828.png)

## 0.3、前端

在资料中还提供了一个`hmall-nginx`的目录。其实就是一个nginx程序以及我们的前端代码，直接在windows下将其复制到一个非中文、不包含特殊字符的目录下。然后进入hmall-nginx后，利用cmd启动即可：

```sh
# 启动nginx
start nginx.exe
# 停止
nginx.exe -s stop
# 重新加载配置
nginx.exe -s reload
# 重启
nginx.exe -s restart
```

> **特别注意**：
>
> nginx.exe 不要双击启动，而是打开cmd窗口，通过命令行启动。停止的时候也一样要是用命令停止。如果启动失败不要重复启动，而是查看logs目录中的error.log日志，查看是否是端口冲突。如果是端口冲突则自行修改端口解决。

启动成功后，访问http://localhost:18080，应该能看到我们的门户页面：

![image-20231229170022668](/assets/images/Java/微服务框架/SpringCloud基础/image-20231229170022668.png)



# 1、认识微服务

这一章我们从单体架构的优缺点来分析，看看开发大型项目采用单体架构存在哪些问题，而微服务架构又是如何解决这些问题的。

## 1.1、单体架构

单体架构（monolithic structure）：顾名思义，整个项目中所有功能模块都在一个工程中开发；项目部署时需要对所有模块一起编译、打包；项目的架构设计、开发模式都非常简单。

![cab19414-bd73-4f96-98f8-e55554e19965](/assets/images/Java/微服务框架/SpringCloud基础/cab19414-bd73-4f96-98f8-e55554e19965.jpg)

当项目规模较小时，这种模式上手快，部署、运维也都很方便，因此早期很多小型项目都采用这种模式。

但随着项目的业务规模越来越大，团队开发人员也不断增加，单体架构就呈现出越来越多的问题：

- **团队协作成本高**：试想一下，你们团队数十个人同时协作开发同一个项目，由于所有模块都在一个项目中，不同模块的代码之间物理边界越来越模糊。最终要把功能合并到一个分支，你绝对会陷入到解决冲突的泥潭之中。
- **系统发布效率低**：任何模块变更都需要发布整个系统，而系统发布过程中需要多个模块之间制约较多，需要对比各种文件，任何一处出现问题都会导致发布失败，往往一次发布需要数十分钟甚至数小时。
- **系统可用性差**：单体架构各个功能模块是作为一个服务部署，相互之间会互相影响，一些热点功能会耗尽系统资源，导致其它服务低可用。

在上述问题中，前两点相信大家在实战过程中应该深有体会。对于第三点系统可用性问题，很多同学可能感触不深。接下来我们就通过黑马商城这个项目，给大家做一个简单演示。

首先，我们修改hm-service模块下的`com.hmall.controller.HelloController`中的`hello`方法，模拟方法执行时的耗时：

![image-20231229173150079](/assets/images/Java/微服务框架/SpringCloud基础/image-20231229173150079.png)

重新启动项目，目前有两个接口是无需登录即可访问的：

- `http://localhost:8080/hi`
- `http://localhost:8080/search/list`



接下来，我们假设`/hi`这个接口是一个并发较高的热点接口，我们通过Jmeter来模拟500个用户不停访问。在资料中已经提供了Jmeter的测试脚本：

![image-20231229173407685](/assets/images/Java/微服务框架/SpringCloud基础/image-20231229173407685.png)

使用JMeter打开上述文件；

![image-20231229175018505](/assets/images/Java/微服务框架/SpringCloud基础/image-20231229175018505.png)

这个脚本会开启300个线程并发请求`http://localhost/hi`这个接口。由于该接口存在执行耗时，这就导致服务端每秒能处理的请求数量有限，最终会有越来越多请求积压，直至Tomcat资源耗尽。这样，其它本来正常的接口（例如`/search/list`）也都会被拖慢，甚至因超时而无法访问了。

我们测试一下，启动测试脚本，然后在浏览器访问`http://localhost:8080/search/list`这个接口，会发现响应速度非常慢：

![image-20231229175348927](/assets/images/Java/微服务框架/SpringCloud基础/image-20231229175348927.png)



如果进一步提高`/hi`这个接口的并发，最终会发现`/search/list`接口的请求响应速度会越来越慢。

可见，单体架构的可用性是比较差的，功能之间相互影响比较大。

当然，有同学会说我们可以做水平扩展。

此时如果我们对系统做水平扩展，增加更多机器，资源还是会被这样的热点接口占用，从而影响到其它接口，并不能从根本上解决问题。这也就是单体架构的扩展性差的一个原因。

而要想解决这些问题，就需要使用微服务架构了。

## 1.2、微服务

微服务架构，首先是服务化，就是将单体架构中的功能模块从单体应用中拆分出来，独立部署为多个服务。同时要满足下面的一些特点：

- **单一职责**：一个微服务负责一部分业务功能，并且其核心数据不依赖于其它模块。
- **团队自治**：每个微服务都有自己独立的开发、测试、发布、运维人员，团队人员规模不超过10人
- **服务自治**：每个微服务都独立打包部署，访问自己独立的数据库。并且要做好服务隔离，避免对其它服务产生影响

例如，黑马商城项目，我们就可以把商品、用户、购物车、交易等模块拆分，交给不同的团队去开发，并独立部署：

![d90890ab-c3c4-4a04-8186-e20dde46750b](/assets/images/Java/微服务框架/SpringCloud基础/d90890ab-c3c4-4a04-8186-e20dde46750b.jpg)

那么，单体架构存在的问题有没有解决呢？

- 团队协作成本高？
  - 由于服务拆分，每个服务代码量大大减少，参与开发的后台人员在1~3名，协作成本大大降低
- 系统发布效率低？
  - 每个服务都是独立部署，当有某个服务有代码变更时，只需要打包部署该服务即可
- 系统可用性差？
  - 每个服务独立部署，并且做好服务隔离，使用自己的服务器资源，不会影响到其它服务。

综上所述，微服务架构解决了单体架构存在的问题，特别适合大型互联网项目的开发，因此被各大互联网公司普遍采用。大家以前可能听说过分布式架构，分布式就是服务拆分的过程，其实微服务架构正是分布式架构的一种最佳实践的方案。

当然，微服务架构虽然能解决单体架构的各种问题，但在拆分的过程中，还会面临很多其它问题。比如：

- 如果出现跨服务的业务该如何处理？
- 页面请求到底该访问哪个服务？
- 如何实现各个服务之间的服务隔离？

这些问题，我们在后续的学习中会给大家逐一解答。

## 1.3、SpringCloud

微服务拆分以后碰到的各种问题都有对应的解决方案和微服务组件，而SpringCloud框架可以说是目前Java领域最全面的微服务组件的集合了。

![image-20231229194604724](/assets/images/Java/微服务框架/SpringCloud基础/image-20231229194604724.png)

而且SpringCloud依托于SpringBoot的自动装配能力，大大降低了其项目搭建、组件使用的成本。对于没有自研微服务组件能力的中小型企业，使用SpringCloud全家桶来实现微服务开发可以说是最合适的选择了！

https://spring.io/projects/spring-cloud#overview

目前SpringCloud最新版本为`2023.0.x`版本，对应的SpringBoot版本为`3.2.x`版本，但2022及后续版本全部依赖于JDK17，目前在企业中使用相对较少。

| **SpringCloud版本**                                          | **SpringBoot版本**                    |
| :----------------------------------------------------------- | :------------------------------------ |
| [2023.0.x](https://github.com/spring-cloud/spring-cloud-release/wiki/Spring-Cloud-2023.0-Release-Notes) aka Leyton | 3.2.x                                 |
| [2022.0.x](https://github.com/spring-cloud/spring-cloud-release/wiki/Spring-Cloud-2022.0-Release-Notes) aka Kilburn | 3.0.x                                 |
| [2021.0.x](https://github.com/spring-cloud/spring-cloud-release/wiki/Spring-Cloud-2021.0-Release-Notes) aka Jubilee | 2.6.x, 2.7.x (Starting with 2021.0.3) |
| [2020.0.x](https://github.com/spring-cloud/spring-cloud-release/wiki/Spring-Cloud-2020.0-Release-Notes) aka Ilford | 2.4.x, 2.5.x (Starting with 2020.0.3) |
| [Hoxton](https://github.com/spring-cloud/spring-cloud-release/wiki/Spring-Cloud-Hoxton-Release-Notes) | 2.2.x, 2.3.x (Starting with SR5)      |
| [Greenwich](https://github.com/spring-projects/spring-cloud/wiki/Spring-Cloud-Greenwich-Release-Notes) | 2.1.x                                 |
| [Finchley](https://github.com/spring-projects/spring-cloud/wiki/Spring-Cloud-Finchley-Release-Notes) | 2.0.x                                 |
| [Edgware](https://github.com/spring-projects/spring-cloud/wiki/Spring-Cloud-Edgware-Release-Notes) | 1.5.x                                 |
| [Dalston](https://github.com/spring-projects/spring-cloud/wiki/Spring-Cloud-Dalston-Release-Notes) | 1.5.x                                 |

因此，我们推荐使用：Spring Cloud 2021.0.x以及Spring Boot 2.7.x版本。

另外，Alibaba的微服务产品SpringCloudAlibaba目前也成为了SpringCloud组件中的一员，我们课堂中也会使用其中的部分组件。

在我们的父工程hmall中已经配置了SpringCloud以及SpringCloudAlibaba的依赖：

![image-20231229201709519](/assets/images/Java/微服务框架/SpringCloud基础/image-20231229201709519.png)

对应的版本：

![image-20231229201807258](/assets/images/Java/微服务框架/SpringCloud基础/image-20231229201807258.png)

这样，我们在后续需要使用SpringCloud或者SpringCloudAlibaba组件时，就无需单独指定版本了。

# 2、微服务拆分

接下来，我们就一起将黑马商城这个单体项目拆分为微服务项目，并解决其中出现的各种问题。

## 2.1、熟悉黑马商城

我们需要熟悉黑马商城项目的基本结构：

![image-20231229202646638](/assets/images/Java/微服务框架/SpringCloud基础/image-20231229202646638.png)

### 2.1.1、登录

首先来看一下登录业务流程：

![image-20240102101346378](/assets/images/Java/微服务框架/SpringCloud基础/image-20240102101346378.png)

登录入口在`com.hmall.controller.UserController`中的`login`方法：

![image-20240102101739799](/assets/images/Java/微服务框架/SpringCloud基础/image-20240102101739799.png)



### 2.1.2、搜索商品

在首页搜索框输入关键字，点击搜索即可进入搜索列表页面：

![image-20240102112308770](/assets/images/Java/微服务框架/SpringCloud基础/image-20240102112308770.png)

该页面会调用接口：`/search/list`，对应的服务端入口在`com.hmall.controller.SearchController`中的`search`方法：

![image-20240102112410211](/assets/images/Java/微服务框架/SpringCloud基础/image-20240102112410211.png)

这里目前是利用数据库实现了简单的分页查询。

### 2.1.3、购物车

在搜索到的商品列表中，点击按钮`加入购物车`，即可将商品加入购物车：

![image-20240102112726402](/assets/images/Java/微服务框架/SpringCloud基础/image-20240102112726402.png)

加入成功后即可进入购物车列表页，查看自己购物车商品列表：

![image-20240102112800515](/assets/images/Java/微服务框架/SpringCloud基础/image-20240102112800515.png)

同时这里还可以对购物车实现修改、删除等操作。

相关功能全部在`com.hmall.controller.CartController`中：

![image-20240102112841861](/assets/images/Java/微服务框架/SpringCloud基础/image-20240102112841861.png)

其中，查询购物车列表时，由于要判断商品最新的价格和状态，所以还需要查询商品信息，业务流程如下：

![image-20240102112954518](/assets/images/Java/微服务框架/SpringCloud基础/image-20240102112954518.png)



### 2.1.4、下单

在购物车页面点击`结算`按钮，会进入订单结算页面：

![image-20240102113530218](/assets/images/Java/微服务框架/SpringCloud基础/image-20240102113530218.png)

点击提交订单，会提交请求到服务端，服务端做3件事情：

- 创建一个新的订单
- 扣减商品库存
- 清理购物车中商品

业务入口在`com.hmall.controller.OrderController`中的`createOrder`方法：

![image-20240102113628712](/assets/images/Java/微服务框架/SpringCloud基础/image-20240102113628712.png)

### 2.1.5、支付

下单完成后会跳转到支付页面，目前只支持**余额支付**：

![image-20240102113855039](/assets/images/Java/微服务框架/SpringCloud基础/image-20240102113855039.png)

在选择**余额支付**这种方式后，会发起请求到服务端，服务端会立刻创建一个支付流水单，并返回支付流水单号到前端。

当用户输入用户密码，然后点击确认支付时，页面会发送请求到服务端，而服务端会做几件事情：

- 校验用户密码
- 扣减余额
- 修改支付流水状态
- 修改交易订单状态

请求入口在`com.hmall.controller.PayController`中：

![image-20240102113808161](/assets/images/Java/微服务框架/SpringCloud基础/image-20240102113808161.png)



## 2.2、服务拆分原则

服务拆分一定要考虑几个问题：

- 什么时候拆？
- 怎么拆？

### 2.2.1、什么时候拆

一般情况下，对于一个初创的项目，首先要做的是验证项目的可行性。因此这一阶段的首要任务是敏捷开发，快速产出生产可用的产品，投入市场做验证。为了达成这一目的，该阶段项目架构往往会比较简单，很多情况下会直接采用单体架构，这样开发成本比较低，可以快速产出结果，一旦发现项目不符合市场，损失较小。

如果这一阶段采用复杂的微服务架构，投入大量的人力和时间成本用于架构设计，最终发现产品不符合市场需求，等于全部做了无用功。

所以，对于**大多数小型项目来说，一般是先采用单体架构**，随着用户规模扩大、业务复杂后**再逐渐拆分为微服务架构**。这样初期成本会比较低，可以快速试错。但是，这么做的问题就在于后期做服务拆分时，可能会遇到很多代码耦合带来的问题，拆分比较困难（**前易后难**）。

而对于一些大型项目，在立项之初目的就很明确，为了长远考虑，在架构设计时就直接选择微服务架构。虽然前期投入较多，但后期就少了拆分服务的烦恼（**前难后易**）。



### 2.2.2、怎么拆

之前我们说过，微服务拆分时**粒度要小**，这其实是拆分的目标。具体可以从两个角度来分析：

- **高内聚**：每个微服务的职责要尽量单一，包含的业务相互关联度高、完整度高。
- **低耦合**：每个微服务的功能要相对独立，尽量减少对其它微服务的依赖，或者依赖接口的稳定性要强。

**高内聚**首先是**单一职责，**但不能说一个微服务就一个接口，而是要保证微服务内部业务的完整性为前提。目标是当我们要修改某个业务时，最好就只修改当前微服务，这样变更的成本更低。

一旦微服务做到了高内聚，那么服务之间的**耦合度**自然就降低了。

当然，微服务之间不可避免的会有或多或少的业务交互，比如下单时需要查询商品数据。这个时候我们不能在订单服务直接查询商品数据库，否则就导致了数据耦合。而应该由商品服务对应暴露接口，并且一定要保证微服务对外**接口的稳定性**（即：尽量保证接口外观不变）。虽然出现了服务间调用，但此时无论你如何在商品服务做内部修改，都不会影响到订单微服务，服务间的耦合度就降低了。

明确了拆分目标，接下来就是拆分方式了。我们在做服务拆分时一般有两种方式：

- **纵向**拆分
- **横向**拆分

所谓**纵向拆分**，就是**按照**项目的**业务功能模块来拆分**。例如黑马商城中，就有用户管理功能、订单管理功能、购物车功能、商品管理功能、支付功能等。那么按照功能模块将他们拆分为一个个服务，就属于纵向拆分。这种拆分模式可以尽可能提高服务的内聚性。

**横向拆分**是看各个功能模块之间有没有公共的业务部分，如果有将其抽取出来作为通用服务。例如用户登录是需要发送消息通知，记录风控数据，下单时也要发送短信，记录风控数据。因此消息发送、风控数据记录就是通用的业务功能，因此可以将他们分别抽取为公共服务：消息中心服务、风控管理服务。这样可以提高业务的复用性，避免重复开发。同时通用业务一般接口稳定性较强，也不会使服务之间过分耦合。

当然，由于黑马商城并不是一个完整的项目，其中的短信发送、风控管理并没有实现，这里就不再考虑了。而其它的业务按照纵向拆分，可以分为以下几个微服务：

- 商品服务
- 购物车服务
- 用户服务
- 订单服务
- 支付服务

## 2.3、拆分商品、购物车服务

接下来，我们先把商品管理、购物车功能功能抽取为两个独立服务。

一般微服务项目有两种不同的工程结构：

- 完全解耦：每一个微服务都创建为一个独立的工程，甚至可以使用不同的开发语言来开发，项目完全解耦。
  - 优点：服务之间耦合度低
  - 缺点：每个项目都有自己的独立仓库，管理起来比较麻烦
- Maven聚合：整个项目为一个Project，然后每个微服务是其中的一个Module
  - 优点：项目代码集中，管理和运维方便（授课也方便）
  - 缺点：服务之间耦合，编译时间较长

**注意**：

为了授课方便，我们会采用Maven聚合工程，大家以后到了企业，可以根据需求自由选择工程结构。

在hmall父工程之中，已经提前定义了SpringBoot、SpringCloud的依赖版本，所以为了方便，期间我们直接在这个项目中创建各个微服务module.

### 2.3.1、商品服务

#### 1）创建模块

在hmall中创建module：

![image-20240102203100790](/assets/images/Java/微服务框架/SpringCloud基础/image-20240102203100790.png)



选择 `New Module` 输入名称为 item-service ；注意JDK要使用 11 。

![image-20240112112803586](/assets/images/Java/微服务框架/SpringCloud基础/image-20240112112803586.png)



#### 2）添加依赖

`item-service`的`pom.xml`文件参考如下：

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.heima</groupId>
        <artifactId>hmall</artifactId>
        <version>1.0.0</version>
    </parent>

    <artifactId>item-service</artifactId>

    <properties>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
    </properties>
    <dependencies>
        <!--common-->
        <dependency>
            <groupId>com.heima</groupId>
            <artifactId>hm-common</artifactId>
            <version>1.0.0</version>
        </dependency>
        <!--web-->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <!--数据库-->
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
        </dependency>
        <!--mybatis-->
        <dependency>
            <groupId>com.baomidou</groupId>
            <artifactId>mybatis-plus-boot-starter</artifactId>
        </dependency>
        <!--单元测试-->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
        </dependency>
    </dependencies>
    <build>
        <finalName>${project.artifactId}</finalName>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>

```

#### 3）创建启动引导类

创建启动引导类 `item-service\src\main\java\com\hmall\item\ItemApplication.java` 代码如下：

```java
package com.hmall.item;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@MapperScan("com.hmall.item.mapper")
@SpringBootApplication
public class ItemApplication {
    public static void main(String[] args) {
        SpringApplication.run(ItemApplication.class, args);
    }
}

```



#### 4）复制配置文件

复制 `hm-service` 中的 `application.yml、application-local.yml、application-dev.yml` 文件到 `item-service` 项目的 `resources`目录如下：

![image-20240103113525046](/assets/images/Java/微服务框架/SpringCloud基础/image-20240103113525046.png)

其中 `application.yml` 文件修改后如下：

```yml
server:
  port: 8081
spring:
  application:
    name: item-service
  profiles:
    active: dev
  datasource:
    url: jdbc:mysql://${hm.db.host}:3306/hm-item?useUnicode=true&characterEncoding=UTF-8&autoReconnect=true&serverTimezone=Asia/Shanghai
    driver-class-name: com.mysql.cj.jdbc.Driver
    username: root
    password: ${hm.db.pw}
mybatis-plus:
  configuration:
    default-enum-type-handler: com.baomidou.mybatisplus.core.handlers.MybatisEnumTypeHandler
  global-config:
    db-config:
      update-strategy: not_null
      id-type: auto
logging:
  level:
    com.hmall: debug
  pattern:
    dateformat: HH:mm:ss:SSS
  file:
    path: "logs/${spring.application.name}"
knife4j:
  enable: true
  openapi:
    title: 商品接口文档
    description: "商品接口文档"
    email: itheima@itcast.cn
    concat: itheima
    url: https://www.itcast.cn
    version: v1.0.0
    group:
      default:
        group-name: default
        api-rule: package
        api-rule-resources:
          - com.hmall.item.controller
```



#### 5）复制代码

复制 `hm-service` 中与商品有关的代码到 `item-service` 中；复制的代码参考如下图：

![image-20240113174431534](/assets/images/Java/微服务框架/SpringCloud基础/image-20240113174431534.png)



这里有一个地方的代码需要改动，就是`ItemServiceImpl`中的`deductStock`方法：

![image-20240103110723804](/assets/images/Java/微服务框架/SpringCloud基础/image-20240103110723804.png)

这也是因为ItemMapper的所在包发生了变化，因此这里代码必须修改包路径。

#### 6）创建数据库表

先创建docker中数据库容器：

```shell
# 创建网络
docker network create hm-net

docker run -d \
  --name mysql \
  -p 3306:3306 \
  -e TZ=Asia/Shanghai \
  -e MYSQL_ROOT_PASSWORD=root \
  -v ./mysql/data:/var/lib/mysql \
  -v ./mysql/conf:/etc/mysql/conf.d \
  -v ./mysql/init:/docker-entrypoint-initdb.d \
  --network hm-net \
  mysql
```

最后，还要导入数据库表。默认的数据库连接的是虚拟机，在你docker数据库执行 `资料\hm-item.sql` 提供的SQL文件：

![image-20240103110841602](/assets/images/Java/微服务框架/SpringCloud基础/image-20240103110841602.png)

将上述脚本文件导入到虚拟机中对应的数据库中；创建数据库表，操作如下：

![image-20240103111441403](/assets/images/Java/微服务框架/SpringCloud基础/image-20240103111441403.png)

![image-20240103111534415](/assets/images/Java/微服务框架/SpringCloud基础/image-20240103111534415.png)

最终，会在数据库创建一个名为`hm-item`的database，将来的每一个微服务都会有自己的一个database：

![image-20240103111551098](/assets/images/Java/微服务框架/SpringCloud基础/image-20240103111551098.png)

> **注意**：在企业开发的生产环境中，每一个微服务都应该有自己的**独立数据库服务**，而不仅仅是database，课堂我们用database来代替。

#### 7）测试

接下来，就可以启动测试了；复制一个启动项并修改如下：

![image-20240103112158101](/assets/images/Java/微服务框架/SpringCloud基础/image-20240103112158101.png)

![image-20240103113915085](/assets/images/Java/微服务框架/SpringCloud基础/image-20240103113915085.png)

修改完后如下：

![image-20240103113957731](/assets/images/Java/微服务框架/SpringCloud基础/image-20240103113957731.png)

接着，启动`item-service`，访问商品微服务的swagger接口文档：http://localhost:8081/doc.html

然后测试其中的根据id批量查询商品这个接口：

![image-20240103114318339](/assets/images/Java/微服务框架/SpringCloud基础/image-20240103114318339.png)

测试参数：100002672302,100002624500,100002533430，结果如下：

![image-20240103114358343](/assets/images/Java/微服务框架/SpringCloud基础/image-20240103114358343.png)

说明商品微服务抽取成功了。



### 2.3.2、购物车服务

#### 1）创建模块

与商品服务类似，在hmall下创建一个新的`module`，起名为`cart-service`:

![image-20240112113018135](/assets/images/Java/微服务框架/SpringCloud基础/image-20240112113018135.png)



右击 `cart-service` 使用IDEA插件 `JBLSpringBootAppGen` 快速生成启动类及删除不相关文件。

![image-20240105150830736](/assets/images/Java/微服务框架/SpringCloud基础/image-20240105150830736.png)

#### 2）添加依赖

打开 `hmall\cart-service\pom.xml` 添加依赖如下：

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.heima</groupId>
        <artifactId>hmall</artifactId>
        <version>1.0.0</version>
    </parent>

    <artifactId>cart-service</artifactId>
    <packaging>jar</packaging>

    <name>cart-service</name>
    <url>http://maven.apache.org</url>

    <properties>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
    </properties>

    <dependencies>
        <!--common-->
        <dependency>
            <groupId>com.heima</groupId>
            <artifactId>hm-common</artifactId>
            <version>1.0.0</version>
        </dependency>
        <!--web-->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!--数据库-->
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
        </dependency>
        <!--mybatis-->
        <dependency>
            <groupId>com.baomidou</groupId>
            <artifactId>mybatis-plus-boot-starter</artifactId>
        </dependency>
        <!--单元测试-->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
        </dependency>

    </dependencies>
    <build>
        <finalName>${project.artifactId}</finalName>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```



#### 3）修改启动引导类

将插件创建的 `CartApplication.java` 添加如下注解：

![image-20240105150425498](/assets/images/Java/微服务框架/SpringCloud基础/image-20240105150425498.png)



#### 4）复制配置文件

复制 `hm-service` 中的 `application.yml、application-local.yml、application-dev.yml` 文件到 `item-service` 项目的 `resources`目录如下：

![image-20240105160547817](/assets/images/Java/微服务框架/SpringCloud基础/image-20240105160547817.png)

其中 `application.yml` 文件修改后如下：

```yml
server:
  port: 8082
spring:
  application:
    name: cart-service
  profiles:
    active: dev
  datasource:
    url: jdbc:mysql://${hm.db.host}:3306/hm-cart?useUnicode=true&characterEncoding=UTF-8&autoReconnect=true&serverTimezone=Asia/Shanghai
    driver-class-name: com.mysql.cj.jdbc.Driver
    username: root
    password: ${hm.db.pw}
mybatis-plus:
  configuration:
    default-enum-type-handler: com.baomidou.mybatisplus.core.handlers.MybatisEnumTypeHandler
  global-config:
    db-config:
      update-strategy: not_null
      id-type: auto
logging:
  level:
    com.hmall: debug
  pattern:
    dateformat: HH:mm:ss:SSS
  file:
    path: "logs/${spring.application.name}"
knife4j:
  enable: true
  openapi:
    title: 购物车接口文档
    description: "购物车接口文档"
    email: itheima@itcast.cn
    concat: itheima
    url: https://www.itcast.cn
    version: v1.0.0
    group:
      default:
        group-name: default
        api-rule: package
        api-rule-resources:
          - com.hmall.cart.controller

```



#### 5）复制代码

复制 `hm-service` 中与购物车有关的代码到 `cart-service` 中；复制的代码参考如下图：

![image-20240105154851391](/assets/images/Java/微服务框架/SpringCloud基础/image-20240105154851391.png)

特别注意的是`com.hmall.cart.service.impl.CartServiceImpl`，其中有两个地方需要处理：

- 需要**获取登录用户信息**，但登录校验功能目前没有复制过来，先写死固定用户id
- 查询购物车时需要**查询商品信息**，而商品信息不在当前服务，需要先将这部分代码注释

修改后 `com.hmall.cart.service.impl.CartServiceImpl` 的代码如下：

```java
package com.hmall.cart.service.impl;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hmall.cart.domain.dto.CartFormDTO;
import com.hmall.cart.domain.po.Cart;
import com.hmall.cart.domain.vo.CartVO;
import com.hmall.cart.mapper.CartMapper;
import com.hmall.cart.service.ICartService;
import com.hmall.common.exception.BizIllegalException;
import com.hmall.common.utils.BeanUtils;
import com.hmall.common.utils.CollUtils;
import com.hmall.common.utils.UserContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * <p>
 * 订单详情表 服务实现类
 * </p>
 *
 * @author itheima
 * @since 2023-05-05
 */
@Service
@RequiredArgsConstructor
public class CartServiceImpl extends ServiceImpl<CartMapper, Cart> implements ICartService {

    //private final IItemService itemService;

    @Override
    public void addItem2Cart(CartFormDTO cartFormDTO) {
        // 1.获取登录用户
        Long userId = UserContext.getUser();

        // 2.判断是否已经存在
        if(checkItemExists(cartFormDTO.getItemId(), userId)){
            // 2.1.存在，则更新数量
            baseMapper.updateNum(cartFormDTO.getItemId(), userId);
            return;
        }
        // 2.2.不存在，判断是否超过购物车数量
        checkCartsFull(userId);

        // 3.新增购物车条目
        // 3.1.转换PO
        Cart cart = BeanUtils.copyBean(cartFormDTO, Cart.class);
        // 3.2.保存当前用户
        cart.setUserId(userId);
        // 3.3.保存到数据库
        save(cart);
    }

    @Override
    public List<CartVO> queryMyCarts() {
        // 1.查询我的购物车列表
        //List<Cart> carts = lambdaQuery().eq(Cart::getUserId, UserContext.getUser()).list();
        // TODO 先将用户的id写死为 1
        List<Cart> carts = lambdaQuery().eq(Cart::getUserId, 1L).list();
        if (CollUtils.isEmpty(carts)) {
            return CollUtils.emptyList();
        }

        // 2.转换VO
        List<CartVO> vos = BeanUtils.copyList(carts, CartVO.class);

        // 3.处理VO中的商品信息
        handleCartItems(vos);

        // 4.返回
        return vos;
    }

    private void handleCartItems(List<CartVO> vos) {
        // 1.获取商品id
        // TODO  暂时无法调用商品服务，先注释
/*
        Set<Long> itemIds = vos.stream().map(CartVO::getItemId).collect(Collectors.toSet());
        // 2.查询商品
        List<ItemDTO> items = itemService.queryItemByIds(itemIds);
        if (CollUtils.isEmpty(items)) {
            return;
        }
        // 3.转为 id 到 item的map
        Map<Long, ItemDTO> itemMap = items.stream().collect(Collectors.toMap(ItemDTO::getId, Function.identity()));
        // 4.写入vo
        for (CartVO v : vos) {
            ItemDTO item = itemMap.get(v.getItemId());
            if (item == null) {
                continue;
            }
            v.setNewPrice(item.getPrice());
            v.setStatus(item.getStatus());
            v.setStock(item.getStock());
        }
*/
    }

    @Override
    public void removeByItemIds(Collection<Long> itemIds) {
        // 1.构建删除条件，userId和itemId
        QueryWrapper<Cart> queryWrapper = new QueryWrapper<Cart>();
        queryWrapper.lambda()
                .eq(Cart::getUserId, UserContext.getUser())
                .in(Cart::getItemId, itemIds);
        // 2.删除
        remove(queryWrapper);
    }

    private void checkCartsFull(Long userId) {
        int count = lambdaQuery().eq(Cart::getUserId, userId).count();
        if (count >= 10) {
            throw new BizIllegalException(StrUtil.format("用户购物车课程不能超过{}", 10));
        }
    }

    private boolean checkItemExists(Long itemId, Long userId) {
        int count = lambdaQuery()
                .eq(Cart::getUserId, userId)
                .eq(Cart::getItemId, itemId)
                .count();
        return count > 0;
    }
}

```



#### 6）创建数据库表

在docker数据库中执行 `资料\hm-cart.sql` 提供的SQL文件：

![image-20240105155104645](/assets/images/Java/微服务框架/SpringCloud基础/image-20240105155104645.png)

执行上述的 sql 脚本文件之后，会在数据库服务中创建 `hm-cart` 数据库如下：

![image-20240105155609657](/assets/images/Java/微服务框架/SpringCloud基础/image-20240105155609657.png)



#### 7）测试

接下来，就可以测试了。不过在启动前，同样要配置启动项的`active profile`为`local`：

![image-20240105155725275](/assets/images/Java/微服务框架/SpringCloud基础/image-20240105155725275.png)

然后启动`CartApplication`，访问swagger文档页面：http://localhost:8082/doc.html

我们测试其中的`查询我的购物车列表`接口：

![image-20240105155906898](/assets/images/Java/微服务框架/SpringCloud基础/image-20240105155906898.png)

无需填写参数，直接访问：

![image-20240105160946489](/assets/images/Java/微服务框架/SpringCloud基础/image-20240105160946489.png)

我们注意到，其中与商品有关的字段值要么空要么是默认值！这就是因为刚才我们注释掉了查询购物车时，查询商品信息的相关代码。

那么，我们该如何在`cart-service`服务中实现对`item-service`服务的查询呢？

## 2.4、服务调用

在拆分的时候，我们发现一个问题：就是购物车业务中需要查询商品信息，但商品信息查询的逻辑全部迁移到了`item-service`服务，导致我们无法查询。

最终结果就是查询到的购物车数据不完整，因此要想解决这个问题，我们就必须改造其中的代码，把原本本地方法调用，改造成跨微服务的远程调用（RPC，即**R**emote **P**roduce **C**all）。

因此，现在查询购物车列表的流程变成了这样：

![image-20240105161424303](/assets/images/Java/微服务框架/SpringCloud基础/image-20240105161424303.png)

代码中需要变化的就是这一步：

![image-20240105161837541](/assets/images/Java/微服务框架/SpringCloud基础/image-20240105161837541.png)

那么问题来了：我们该如何跨服务调用，准确的说，如何在`cart-service`中获取`item-service`服务中的提供的商品数据呢？

大家思考一下，我们以前有没有实现过类似的远程查询的功能呢？

答案是肯定的，我们前端向服务端查询数据，其实就是从浏览器远程查询服务端数据。比如我们刚才通过Swagger测试商品查询接口，就是向`http://localhost:8081/items`这个接口发起的请求：

![image-20240105162344494](/assets/images/Java/微服务框架/SpringCloud基础/image-20240105162344494.png)

而这种查询就是通过http请求的方式来完成的，不仅仅可以实现远程查询，还可以实现新增、删除等各种远程请求。

>  假如我们在cart-service中能模拟浏览器，发送http请求到item-service，是不是就实现了跨微服务的**远程调用**了呢？

那么：我们该如何用Java代码发送Http的请求呢？

### 2.4.1、RestTemplate

Spring给我们提供了一个RestTemplate的API，可以方便的实现Http请求的发送。

> org.springframework.web.client public class RestTemplate
>
> extends InterceptingHttpAccessor
>
> implements RestOperations
>
> \----------------------------------------------------------------------------------------------------------------
>
> 同步客户端执行HTTP请求，在底层HTTP客户端库(如JDK HttpURLConnection、Apache HttpComponents等)上公开一个简单的模板方法API。RestTemplate通过HTTP方法为常见场景提供了模板，此外还提供了支持不太常见情况的通用交换和执行方法。 RestTemplate通常用作共享组件。然而，它的配置不支持并发修改，因此它的配置通常是在启动时准备的。如果需要，您可以在启动时创建多个不同配置的RestTemplate实例。如果这些实例需要共享HTTP客户端资源，它们可以使用相同的底层ClientHttpRequestFactory。 注意:从5.0开始，这个类处于维护模式，只有对更改和错误的小请求才会被接受。请考虑使用org.springframework.web.react .client. webclient，它有更现代的API，支持同步、异步和流场景。  
>
> \----------------------------------------------------------------------------------------------------------------
>
> 自: 3.0 参见: HttpMessageConverter, RequestCallback, ResponseExtractor, ResponseErrorHandler

其中提供了大量的方法，方便我们发送Http请求，例如：

![image-20240105163508192](/assets/images/Java/微服务框架/SpringCloud基础/image-20240105163508192.png)

查看 `RestTemplate`类可以看到常见的Get、Post、Put、Delete请求都支持，如果请求参数比较复杂，还可以使用exchange方法来构造请求。

我们在`cart-service`服务中定义一个配置类：

![image-20240105163928090](/assets/images/Java/微服务框架/SpringCloud基础/image-20240105163928090.png)

先将 RestTemplate 注册为一个Bean；具体代码如下：

```java
package com.hmall.cart.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RemoteCallConfig {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}

```



### 2.4.2、远程调用

从 `hm-service` 中复制 ``

接下来，我们修改`cart-service`中的`com.hmall.cart.service.impl.CartServiceImpl`的`handleCartItems`方法，发送http请求到`item-service`：

![image-20240105165540617](/assets/images/Java/微服务框架/SpringCloud基础/image-20240105165540617.png)

可以看到，利用RestTemplate发送http请求与前端ajax发送请求非常相似，都包含四部分信息：

- ① 请求方式
- ② 请求路径
- ③ 响应数据类型
- ④  请求参数

具体 `com.hmall.cart.service.impl.CartServiceImpl` 修改后：

```java
package com.hmall.cart.service.impl;

...

/**
 * <p>
 * 订单详情表 服务实现类
 * </p>
 *
 * @author itheima
 * @since 2023-05-05
 */
@Service
@RequiredArgsConstructor
public class CartServiceImpl extends ServiceImpl<CartMapper, Cart> implements ICartService {

    //private final IItemService itemService;
    private final RestTemplate restTemplate;

    ...

    private void handleCartItems(List<CartVO> vos) {
        // 1.获取商品id
        Set<Long> itemIds = vos.stream().map(CartVO::getItemId).collect(Collectors.toSet());
        // 2.查询商品
        String itemUrl = "http://localhost:8081/items?ids={ids}";
        ResponseEntity<List<ItemDTO>> response = restTemplate.exchange(
                itemUrl,//请求路径
                HttpMethod.GET,//请求方式
                null,//请求实体
                new ParameterizedTypeReference<List<ItemDTO>>() {
                },//响应数据类型
                Map.of("ids", CollUtils.join(itemIds, ","))//请求参数
        );
        List<ItemDTO> items = null;
        if (response.getStatusCode().is2xxSuccessful()) {
            items = response.getBody();
        }
        if (CollUtils.isEmpty(items)) {
            return;
        }
        // 3.转为 id 到 item的map
        Map<Long, ItemDTO> itemMap = items.stream().collect(Collectors.toMap(ItemDTO::getId, Function.identity()));
        // 4.写入vo
        for (CartVO v : vos) {
            ItemDTO item = itemMap.get(v.getItemId());
            if (item == null) {
                continue;
            }
            v.setNewPrice(item.getPrice());
            v.setStatus(item.getStatus());
            v.setStock(item.getStock());
        }

    }

   ...
}

```

现在重启`cart-service`，再次测试查询我的购物车列表接口：

![image-20240105165817677](/assets/images/Java/微服务框架/SpringCloud基础/image-20240105165817677.png)

可以发现，所有商品相关数据都已经查询到了。

在这个过程中，`item-service`提供了查询接口，`cart-service`利用Http请求调用该接口。因此`item-service`可以称为服务的提供者，而`cart-service`则称为服务的消费者或服务调用者。

## 2.5、总结

什么时候需要拆分微服务？

- 如果是创业型公司，最好先用单体架构快速迭代开发，验证市场运作模型，快速试错。当业务跑通以后，随着业务规模扩大、人员规模增加，再考虑拆分微服务。
- 如果是大型企业，有充足的资源，可以在项目开始之初就搭建微服务架构。

如何拆分？

- 首先要做到高内聚、低耦合
- 从拆分方式来说，有横向拆分和纵向拆分两种。纵向就是按照业务功能模块，横向则是拆分通用性业务，提高复用性

服务拆分之后，不可避免的会出现跨微服务的业务，此时微服务之间就需要进行远程调用。微服务之间的远程调用被称为RPC，即远程过程调用。RPC的实现方式有很多，比如：

- 基于Http协议
- 基于Dubbo协议

我们课堂中使用的是Http方式，这种方式不关心服务提供者的具体技术实现，只要对外暴露Http接口即可，更符合微服务的需要。

Java发送http请求可以使用Spring提供的RestTemplate，使用的基本步骤如下：

- 注册RestTemplate到Spring容器
- 调用RestTemplate的API发送请求，常见方法有：
  - getForObject：发送Get请求并返回指定类型对象
  - PostForObject：发送Post请求并返回指定类型对象
  - put：发送PUT请求
  - delete：发送Delete请求
  - exchange：发送任意类型请求，返回ResponseEntity



# 3、服务注册与发现

在上一章我们实现了微服务拆分，并且通过Http请求实现了跨微服务的远程调用。不过这种手动发送Http请求的方式存在一些问题。

试想一下，假如商品微服务被调用较多，为了应对更高的并发，我们进行了多实例部署，如图：

![image-20240105171039026](/assets/images/Java/微服务框架/SpringCloud基础/image-20240105171039026.png)

此时，每个`item-service`的实例其IP或端口不同，问题来了：

- item-service这么多实例，cart-service如何知道每一个实例的地址？
- http请求要写url地址，`cart-service`服务到底该调用哪个实例呢？
- 如果在运行过程中，某一个`item-service`实例宕机，`cart-service`依然在调用该怎么办？
- 如果并发太高，`item-service`临时多部署了N台实例，`cart-service`如何知道新实例的地址？

为了解决上述问题，就必须引入注册中心的概念了，接下来我们就一起来分析下注册中心的原理。

## 3.1、注册中心原理

在微服务远程调用的过程中，包括两个角色：

- 服务提供者：提供接口供其它微服务访问，比如`item-service`
- 服务消费者：调用其它微服务提供的接口，比如`cart-service`

在大型微服务项目中，服务提供者的数量会非常多，为了管理这些服务就引入了**注册中心**的概念。注册中心、服务提供者、服务消费者三者间关系如下：

![image-20240105171618597](/assets/images/Java/微服务框架/SpringCloud基础/image-20240105171618597.png)

流程如下：

- 服务启动时就会注册自己的服务信息（服务名、IP、端口）到注册中心
- 调用者可以从注册中心订阅想要的服务，获取服务对应的实例列表（1个服务可能多实例部署）
- 调用者自己对实例列表负载均衡，挑选一个实例
- 调用者向该实例发起远程调用

当服务提供者的实例宕机或者启动新实例时，调用者如何得知呢？

- 服务提供者会定期向注册中心发送请求，报告自己的健康状态（心跳请求）
- 当注册中心长时间收不到提供者的心跳时，会认为该实例宕机，将其从服务的实例列表中剔除
- 当服务有新实例启动时，会发送注册服务请求，其信息会被记录在注册中心的服务实例列表
- 当注册中心服务列表变更时，会主动通知微服务，更新本地服务列表

## 3.2、Nacos注册中心

### 3.2.1、注册中心简介

目前开源的注册中心框架有很多，国内比较常见的有：

- Eureka：Netflix公司出品，目前被集成在SpringCloud当中，一般用于Java应用
- Nacos：Alibaba公司出品，目前被集成在SpringCloudAlibaba中，一般用于Java应用
- Consul：HashiCorp公司出品，目前集成在SPringCloud中，不限制微服务语言

以上几种注册中心都遵循SpringCloud中的API规范，因此在业务开发使用上没有太大差异。由于Nacos是国内产品，中文文档比较丰富，而且同时具备**配置管理**功能（后面会学习），因此在国内使用较多，课堂中我们会Nacos为例来学习。

[Nacos官方网站](https://nacos.io/zh-cn/)如下：

![image-20240105171935295](/assets/images/Java/微服务框架/SpringCloud基础/image-20240105171935295.png)

### 3.2.2、安装Nacos

#### 1）创建Nacos数据库

我们基于Docker来部署Nacos的注册中心，首先我们要准备MySQL数据库表，用来存储Nacos的数据。由于是Docker部署，所以大家需要将资料中的 `nacos.sql` SQL文件导入到你**Docker中的MySQL容器**中：

![image-20240105172734543](/assets/images/Java/微服务框架/SpringCloud基础/image-20240105172734543.png)

运行上述的SQL脚本文件之后；创建的nacos数据库表如下：

![image-20240105172904735](/assets/images/Java/微服务框架/SpringCloud基础/image-20240105172904735.png)

#### 2）创建Nacos容器

找到`资料\nacos\custom.env`文件；修改文件中的 `MYSQL_SERVICE_HOST`、`MYSQL_SERVICE_PASSWORD`等，改为你自己虚拟机中的mysql容器对应的信息。

![image-20240105173217807](/assets/images/Java/微服务框架/SpringCloud基础/image-20240105173217807.png)

然后，将 `资料\nacos`目录上传至虚拟机的`/root`目录。

进入root目录，然后执行下面的docker命令：

```PowerShell

docker run -d \
--name nacos \
--env-file ./nacos/custom.env \
-p 8848:8848 \
-p 9848:9848 \
-p 9849:9849 \
--network hm-net \
--restart=always \
nacos/nacos-server:v2.1.0-slim
```

> **注意**：如果下载 nacos 镜像有问题的话；则可使用资料提供的 nacos.tar 
>
> 加载镜像的命令为：docker load -i nacos.tar

启动完成后，访问下面地址：http://192.168.12.168:8848/nacos/，注意将`192.168.12.168`替换为你自己的虚拟机IP地址。首次访问会跳转到登录页，**账号密码都是nacos**

![image-20240105202337596](/assets/images/Java/微服务框架/SpringCloud基础/image-20240105202337596.png)

使用 nacos/nacos 登录之后：

![image-20240105202636900](/assets/images/Java/微服务框架/SpringCloud基础/image-20240105202636900.png)

## 3.3、服务注册

接下来，我们把`item-service`注册到Nacos，步骤如下：

- 添加依赖
- 配置Nacos
- 重启

### 3.3.1、添加依赖

需要在 `item-service` 项目的 `pom.xml` 中添加如下依赖：

```xml
<!--nacos 服务注册发现-->
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
</dependency>
```

### 3.3.2、配置Nacos

在`item-service`的`application.yml`中添加nacos地址配置如下：

![image-20240105204225180](/assets/images/Java/微服务框架/SpringCloud基础/image-20240105204225180.png)

### 3.3.3、重启

为了测试一个服务多个实例的情况，我们再配置一个`item-service`的部署实例：

![image-20240105204555300](/assets/images/Java/微服务框架/SpringCloud基础/image-20240105204555300.png)

然后配置启动项，注意重命名并且配置新的端口，避免冲突：

![image-20240112173656638](/assets/images/Java/微服务框架/SpringCloud基础/image-20240112173656638.png)



重启`item-service`的两个实例：

![image-20240112173913673](/assets/images/Java/微服务框架/SpringCloud基础/image-20240112173913673.png)



访问nacos控制台，可以发现服务注册成功：

![image-20240105205533849](/assets/images/Java/微服务框架/SpringCloud基础/image-20240105205533849.png)

点击详情，可以查看到`item-service`服务的两个实例信息：

![image-20240112174130204](/assets/images/Java/微服务框架/SpringCloud基础/image-20240112174130204.png)

## 3.4、服务发现

服务的消费者要去nacos订阅服务，这个过程就是服务发现，步骤如下：

- 引入依赖
- 配置Nacos
- 发现并调用服务

### 3.4.1、引入依赖

我们在`cart-service`中的`pom.xml`中添加下面的依赖：

```XML
<!--nacos 服务注册发现-->
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
</dependency>
```

可以发现，这里Nacos的依赖于服务注册时一致，这个依赖中同时包含了服务注册和发现的功能。因为任何一个微服务都可以调用别人，也可以被别人调用，即可以是调用者，也可以是提供者。

因此，等一会儿`cart-service`启动，同样会注册到Nacos。

### 3.4.2、配置Nacos

在`cart-service`的`application.yaml`中添加nacos地址配置参考如下：

![image-20240105211404483](/assets/images/Java/微服务框架/SpringCloud基础/image-20240105211404483.png)

### 3.4.3、发现并调用服务

接下来，服务调用者`cart-service`就可以去订阅`item-service`服务了。不过item-service有多个实例，而真正发起调用时只需要知道一个实例的地址。

因此，服务调用者必须利用负载均衡的算法，从多个实例中挑选一个去访问。常见的负载均衡算法有：

- 随机
- 轮询
- IP的hash
- 最近最少访问
- ...

这里我们可以选择最简单的随机负载均衡。

另外，服务发现需要用到一个工具，DiscoveryClient，SpringCloud已经帮我们自动装配，我们可以直接注入使用：

![image-20240105212102901](/assets/images/Java/微服务框架/SpringCloud基础/image-20240105212102901.png)

接下来，我们就可以对原来的远程调用做修改了，之前调用时我们需要写死服务提供者的IP和端口：

![image-20240105212117270](/assets/images/Java/微服务框架/SpringCloud基础/image-20240105212117270.png)



但现在不需要了，我们通过DiscoveryClient发现服务实例列表，然后通过负载均衡算法，选择一个实例去调用；具体代码修改如下：

![image-20240105212124334](/assets/images/Java/微服务框架/SpringCloud基础/image-20240105212124334.png)

重启 `cart-service` 经过swagger测试，发现没有任何问题。



# 4、OpenFeign

在上一章，我们利用Nacos实现了服务的治理，利用RestTemplate实现了服务的远程调用。但是远程调用的代码太复杂了：

![image-20240105212124334](/assets/images/Java/微服务框架/SpringCloud基础/image-20240105212124334.png)

而且这种调用方式，与原本的本地方法调用差异太大，编程时的体验也不统一，一会儿远程调用，一会儿本地调用。

因此，我们必须想办法改变远程调用的开发模式，让**远程调用像本地方法调用一样简单**。而这就要用到OpenFeign组件了。

其实远程调用的关键点就在于四个：

- 请求方式
- 请求路径
- 请求参数
- 返回值类型

所以，OpenFeign就利用SpringMVC的相关注解来声明上述4个参数，然后基于动态代理帮我们生成远程调用的代码，而无需我们手动再编写，非常方便。

接下来，我们就通过一个快速入门的案例来体验一下OpenFeign的便捷吧。

## 4.1、快速入门

我们还是以cart-service中的查询我的购物车为例。因此下面的操作都是在cart-service中进行。

### 4.1.1、添加依赖

在`cart-service`服务的pom.xml中引入`OpenFeign`的依赖和`loadBalancer`依赖：

```xml
  <!--openFeign-->
  <dependency>
      <groupId>org.springframework.cloud</groupId>
      <artifactId>spring-cloud-starter-openfeign</artifactId>
  </dependency>
  <!--负载均衡器-->
  <dependency>
      <groupId>org.springframework.cloud</groupId>
      <artifactId>spring-cloud-starter-loadbalancer</artifactId>
  </dependency>
```



### 4.1.2、启用OpenFeign

接下来，我们在`cart-service`的`CartApplication`启动类上添加注解，启动OpenFeign功能：

![image-20240106143033252](/assets/images/Java/微服务框架/SpringCloud基础/image-20240106143033252.png)

### 4.1.3、编写OpenFeign客户端

在`cart-service`中，定义一个新的接口，编写Feign客户端 `com.hmall.cart.client.ItemClient` ；其代码如下：

```java
package com.hmall.cart.client;

import com.hmall.cart.domain.dto.ItemDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient("item-service")
public interface ItemClient {

    @GetMapping("/items")
    List<ItemDTO> queryItemByIds(@RequestParam("ids") Collection<Long> ids);

}

```

这里只需要声明接口，无需实现方法。接口中的几个关键信息：

- `@FeignClient("item-service")` ：声明服务名称
- `@GetMapping` ：声明请求方式
- `@GetMapping("/items")` ：声明请求路径
- `@RequestParam("ids") Collection<Long> ids` ：声明请求参数
- `List` ：返回值类型

有了上述信息，OpenFeign就可以利用动态代理帮我们实现这个方法，并且向`http://item-service/items`发送一个`GET`请求，携带ids为请求参数，并自动将返回值处理为`List`。

我们只需要直接调用这个方法，即可实现远程调用了。

### 4.1.4、使用FeignClient

最后，我们在`cart-service`的`com.hmall.cart.service.impl.CartServiceImpl`中改造代码，直接调用`ItemClient`的方法：

```java
package com.hmall.cart.service.impl;

...
    
@Service
@RequiredArgsConstructor
public class CartServiceImpl extends ServiceImpl<CartMapper, Cart> implements ICartService {

    private final ItemClient itemClient;

    ...

    private void handleCartItems(List<CartVO> vos) {
        // 1.获取商品id
        Set<Long> itemIds = vos.stream().map(CartVO::getItemId).collect(Collectors.toSet());
        // 2.查询商品
        //2.1. 发现 item-service 的服务实例
        /*List<ServiceInstance> instances = discoveryClient.getInstances("item-service");
        if (CollUtils.isEmpty(instances)) {
            return;
        }
        //2.2. 随机选一个item-service的服务实例
        ServiceInstance serviceInstance = instances.get(RandomUtil.randomInt(instances.size()));
        // 根据实例地址拼接接口
        String itemUrl = serviceInstance.getUri()+"/items?ids={ids}";
        ResponseEntity<List<ItemDTO>> response = restTemplate.exchange(
                itemUrl,//请求路径
                HttpMethod.GET,//请求方式
                null,//请求实体
                new ParameterizedTypeReference<List<ItemDTO>>() {
                },//响应数据类型
                Map.of("ids", CollUtils.join(itemIds, ","))//请求参数
        );*/
        List<ItemDTO> items = itemClient.queryItemByIds(itemIds);
        /*if (response.getStatusCode().is2xxSuccessful()) {
            items = response.getBody();
        }*/
        if (CollUtils.isEmpty(items)) {
            return;
        }
        // 3.转为 id 到 item的map
        Map<Long, ItemDTO> itemMap = items.stream().collect(Collectors.toMap(ItemDTO::getId, Function.identity()));
        // 4.写入vo
        for (CartVO v : vos) {
            ItemDTO item = itemMap.get(v.getItemId());
            if (item == null) {
                continue;
            }
            v.setNewPrice(item.getPrice());
            v.setStatus(item.getStatus());
            v.setStock(item.getStock());
        }

    }

   ...
}

```

feign替我们完成了服务拉取、负载均衡、发送http请求的所有工作，是不是看起来优雅多了。

而且，这里我们不再需要RestTemplate了，还省去了RestTemplate的注册。

## 4.2、连接池

Feign底层发起http请求，依赖于其它的框架。其底层支持的http客户端实现包括：

- HttpURLConnection：默认实现，不支持连接池
- Apache HttpClient ：支持连接池
- OKHttp：支持连接池

因此我们通常会使用带有连接池的客户端来代替默认的HttpURLConnection。比如，我们使用OK Http.

### 4.2.1、添加依赖

在`cart-service`的`pom.xml`中添加如下依赖：

```xml
<!--OK http 的依赖 -->
<dependency>
  <groupId>io.github.openfeign</groupId>
  <artifactId>feign-okhttp</artifactId>
</dependency>
```

### 4.2.2、开启连接池

在`cart-service`的`application.yaml`配置文件中开启Feign的连接池功能：

```yml
feign:
  okhttp:
    enabled: true
```

重启服务，连接池就生效了。

### 4.2.3、测试

我们可以打断点验证连接池是否生效，在`org.springframework.cloud.openfeign.loadbalancer.FeignBlockingLoadBalancerClient`中的`execute`方法中打断点：

![image-20240106153429659](/assets/images/Java/微服务框架/SpringCloud基础/image-20240106153429659.png)

Debug方式启动cart-service，请求一次查询我的购物车方法，进入断点：

![image-20240106153436877](/assets/images/Java/微服务框架/SpringCloud基础/image-20240106153436877.png)

可以发现这里底层的实现已经改为`OkHttpClient`

## 4.3、最佳实践

将来我们要把与下单有关的业务抽取为一个独立微服务:`trade-service`，不过我们先来看一下`hm-service`中原本与下单有关的业务逻辑。

入口在`com.hmall.controller.OrderController`的`createOrder`方法，然后调用了`IOrderService`中的`createOrder`方法。

由于下单时前端提交了商品id，为了计算订单总价，需要查询商品信息：

![image-20240106153736559](/assets/images/Java/微服务框架/SpringCloud基础/image-20240106153736559.png)

也就是说，如果拆分了交易微服务（`trade-service`），它也需要远程调用`item-service`中的根据id批量查询商品功能。这个需求与`cart-service`中是一样的。

因此，我们就需要在`trade-service`中再次定义`ItemClient`接口，这不是重复编码吗？ 有什么办法能加避免重复编码呢？

### 4.3.1、思路分析

相信大家都能想到，避免重复编码的办法就是**抽取**。不过这里有两种抽取思路：

- 思路1：抽取到微服务之外的公共module
- 思路2：每个微服务自己抽取一个module

如图：

![image-20240106154447623](/assets/images/Java/微服务框架/SpringCloud基础/image-20240106154447623.png)

方案1抽取更加简单，工程结构也比较清晰，但缺点是整个项目耦合度偏高。

方案2抽取相对麻烦，工程结构相对更复杂，但服务之间耦合度降低。

由于item-service已经创建好，无法继续拆分，因此这里我们采用方案1。

### 4.3.2、抽取Feign客户端

在`hmall`下定义一个新的module，命名为 `hm-api`

![image-20240106155427613](/assets/images/Java/微服务框架/SpringCloud基础/image-20240106155427613.png)

`hm-api` 的依赖 `hmall\hm-api\pom.xml` 添加为如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.heima</groupId>
        <artifactId>hmall</artifactId>
        <version>1.0.0</version>
    </parent>

    <artifactId>hm-api</artifactId>

    <properties>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>
    <dependencies>
        <!--common-->
        <dependency>
            <groupId>com.heima</groupId>
            <artifactId>hm-common</artifactId>
            <version>1.0.0</version>
        </dependency>

        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-openfeign</artifactId>
        </dependency>

        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-loadbalancer</artifactId>
        </dependency>
        <dependency>
            <groupId>io.github.openfeign</groupId>
            <artifactId>feign-okhttp</artifactId>
        </dependency>
    </dependencies>
    <build>
        <finalName>${project.artifactId}</finalName>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

然后把 `cart-service`中的 ItemDTO和ItemClient都拷贝过来，最终结构如下：

![image-20240106160456239](/assets/images/Java/微服务框架/SpringCloud基础/image-20240106160456239.png)

现在，任何微服务要调用`item-service`中的接口，只需要引入`hm-api`模块依赖即可，无需自己编写Feign客户端了。

### 4.3.3、配置feign包扫描

接下来，我们在`cart-service`的`pom.xml`中引入`hm-api`模块：

```xml
  <!--feign模块-->
  <dependency>
      <groupId>com.heima</groupId>
      <artifactId>hm-api</artifactId>
      <version>1.0.0</version>
  </dependency>
```

删除`cart-service`中原来的ItemDTO和ItemClient，重启项目，发现报错了：

![image-20240106160800446](/assets/images/Java/微服务框架/SpringCloud基础/image-20240106160800446.png)

这里因为`ItemClient`现在定义到了`com.hmall.api.client`包下，而cart-service的启动类定义在`com.hmall.cart`包下，扫描不到`ItemClient`，所以报错了。

解决办法很简单，在cart-service的启动类上添加声明即可，两种方式：

- **方式1**：声明扫描包

![image-20240106160953263](/assets/images/Java/微服务框架/SpringCloud基础/image-20240106160953263.png)

- **方式2**：声明要用的FeignClient

![image-20240106161048401](/assets/images/Java/微服务框架/SpringCloud基础/image-20240106161048401.png)



以免后续FeignClient增多需要逐个添加；我们这里使用**方式1**。 重新启动测试则不会再报上面的错误了。

## 4.4、日志配置

OpenFeign只会在FeignClient所在包的日志级别为**DEBUG**时，才会输出日志。而且其日志级别有4级：

- **NONE**：不记录任何日志信息，这是默认值。
- **BASIC**：仅记录请求的方法，URL以及响应状态码和执行时间
- **HEADERS**：在BASIC的基础上，额外记录了请求和响应的头信息
- **FULL**：记录所有请求和响应的明细，包括头信息、请求体、元数据。

Feign默认的日志级别就是NONE，所以默认我们看不到请求日志。

### 4.4.1、定义日志级别

在hm-api模块下新建一个配置类 `com.hmall.api.config.DefaultFeignConfig`，定义Feign的日志级别：

![image-20240106163723719](/assets/images/Java/微服务框架/SpringCloud基础/image-20240106163723719.png)

代码如下：

```java
package com.hmall.api.config;

import feign.Logger;
import org.springframework.context.annotation.Bean;

public class DefaultFeignConfig {

    //配置feign的日志级别
    @Bean
    public Logger.Level feignLoggerLevel(){
        return Logger.Level.FULL;
    }
}

```



### 4.4.2、配置

接下来，要让日志级别生效，还需要配置这个类。有两种方式：

- **局部**生效：在某个`FeignClient`中配置，只对当前`FeignClient`生效

  ![image-20240106164129657](/assets/images/Java/微服务框架/SpringCloud基础/image-20240106164129657.png)

- **全局**生效：在`@EnableFeignClients`中配置，针对所有`FeignClient`生效。

  ![image-20240108111759629](/assets/images/Java/微服务框架/SpringCloud基础/image-20240108111759629.png)

配置生效之后，在控制台打印的日志格式如下：

```log
16:35:50:991 DEBUG 6188 --- [nio-8082-exec-2] com.hmall.api.client.ItemClient          : [ItemClient#queryItemByIds] ---> GET http://item-service/items?ids=100000006163 HTTP/1.1
16:35:50:991 DEBUG 6188 --- [nio-8082-exec-2] com.hmall.api.client.ItemClient          : [ItemClient#queryItemByIds] ---> END HTTP (0-byte body)
16:35:51:740 DEBUG 6188 --- [nio-8082-exec-2] com.hmall.api.client.ItemClient          : [ItemClient#queryItemByIds] <--- HTTP/1.1 200  (748ms)
16:35:51:741 DEBUG 6188 --- [nio-8082-exec-2] com.hmall.api.client.ItemClient          : [ItemClient#queryItemByIds] connection: keep-alive
16:35:51:741 DEBUG 6188 --- [nio-8082-exec-2] com.hmall.api.client.ItemClient          : [ItemClient#queryItemByIds] content-type: application/json
16:35:51:741 DEBUG 6188 --- [nio-8082-exec-2] com.hmall.api.client.ItemClient          : [ItemClient#queryItemByIds] date: Sat, 06 Jan 2024 08:35:51 GMT
16:35:51:741 DEBUG 6188 --- [nio-8082-exec-2] com.hmall.api.client.ItemClient          : [ItemClient#queryItemByIds] keep-alive: timeout=60
16:35:51:741 DEBUG 6188 --- [nio-8082-exec-2] com.hmall.api.client.ItemClient          : [ItemClient#queryItemByIds] transfer-encoding: chunked
16:35:51:741 DEBUG 6188 --- [nio-8082-exec-2] com.hmall.api.client.ItemClient          : [ItemClient#queryItemByIds] 
16:35:51:742 DEBUG 6188 --- [nio-8082-exec-2] com.hmall.api.client.ItemClient          : [ItemClient#queryItemByIds] [{"id":"100000006163","name":"巴布豆(BOBDOG)柔薄悦动婴儿拉拉裤XXL码80片(15kg以上)","price":67100,"stock":10000,"image":"https://m.360buyimg.com/mobilecms/s720x720_jfs/t23998/350/2363990466/222391/a6e9581d/5b7cba5bN0c18fb4f.jpg!q70.jpg.webp","category":"拉拉裤","brand":"巴布豆","spec":"{}","sold":11,"commentCount":33343434,"isAD":false,"status":2}]
16:35:51:743 DEBUG 6188 --- [nio-8082-exec-2] com.hmall.api.client.ItemClient          : [ItemClient#queryItemByIds] <--- END HTTP (371-byte body)
```



# 5、作业

## 5.1、拆分微服务

将hm-service中的其它业务也都拆分为微服务，包括：

- user-service：用户微服务，包含用户登录、管理等功能
- trade-service：交易微服务，包含订单相关功能
- pay-service：支付微服务，包含支付相关功能

其中交易服务、支付服务、用户服务中的业务都需要知道当前登录用户是谁，目前暂未实现，先将用户id写死。



### 5.1.1、用户微服务

#### 1）创建user-service模块

在hmall下新建一个module，命名为`user-service`：

![image-20240112113116924](/assets/images/Java/微服务框架/SpringCloud基础/image-20240112113116924.png)



#### 2）添加依赖

参考 `cart-service` 的依赖；`user-service` 的`pom.xml`文件内容如下：

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.heima</groupId>
        <artifactId>hmall</artifactId>
        <version>1.0.0</version>
    </parent>

    <artifactId>user-service</artifactId>
    <properties>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
    </properties>

    <dependencies>
        <!--common-->
        <dependency>
            <groupId>com.heima</groupId>
            <artifactId>hm-common</artifactId>
            <version>1.0.0</version>
        </dependency>
        <dependency>
            <groupId>com.heima</groupId>
            <artifactId>hm-api</artifactId>
            <version>1.0.0</version>
        </dependency>
        <!--web-->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!--数据库-->
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
        </dependency>
        <!--mybatis-->
        <dependency>
            <groupId>com.baomidou</groupId>
            <artifactId>mybatis-plus-boot-starter</artifactId>
        </dependency>
        <!--单元测试-->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
        </dependency>
        <!--nacos 服务注册发现-->
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
        </dependency>

    </dependencies>
    <build>
        <finalName>${project.artifactId}</finalName>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```



#### 3）启动类

右击 user-service ；选择 `JBLSpringBootAppGen` 创建启动引导类如下：

![image-20240106171534540](/assets/images/Java/微服务框架/SpringCloud基础/image-20240106171534540.png)

在user-service中的`com.hmall.user`包下创建的启动类参考如下：

```java
package com.hmall.user;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@MapperScan("com.hmall.user.mapper")
@SpringBootApplication
public class UserApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserApplication.class, args);
    }
}

```



#### 4）复制配置文件

从`hm-service`项目中复制3个yaml配置文件到`user-service`的`resources`目录。

其中`application-dev.yaml`和`application-local.yaml`保持不变。`application.yaml`如下：

```yml
server:
  port: 8083
spring:
  application:
    name: user-service
  cloud:
    nacos:
      server-addr: 192.168.12.168:8848    
  profiles:
    active: dev
  datasource:
    url: jdbc:mysql://${hm.db.host}:3306/hm-user?useUnicode=true&characterEncoding=UTF-8&autoReconnect=true&serverTimezone=Asia/Shanghai
    driver-class-name: com.mysql.cj.jdbc.Driver
    username: root
    password: ${hm.db.pw}
mybatis-plus:
  configuration:
    default-enum-type-handler: com.baomidou.mybatisplus.core.handlers.MybatisEnumTypeHandler
  global-config:
    db-config:
      update-strategy: not_null
      id-type: auto
logging:
  level:
    com.hmall: debug
  pattern:
    dateformat: HH:mm:ss:SSS
  file:
    path: "logs/${spring.application.name}"
knife4j:
  enable: true
  openapi:
    title: 用户接口文档
    description: "用户接口文档"
    email: itheima@itcast.cn
    concat: itheima
    url: https://www.itcast.cn
    version: v1.0.0
    group:
      default:
        group-name: default
        api-rule: package
        api-rule-resources:
          - com.hmall.user.controller
hm:
  jwt:
    location: classpath:hmall.jks
    alias: hmall
    password: hmall123
    tokenTTL: 30m
```

将hm-service下的hmall.jks文件拷贝到user-service下的resources目录，这是JWT加密的秘钥文件：

![image-20240106174704086](/assets/images/Java/微服务框架/SpringCloud基础/image-20240106174704086.png)

#### 5）复制代码

复制hm-service中所有与user、address、jwt有关的代码，最终`user-service`项目结构如下：

![image-20240106173935057](/assets/images/Java/微服务框架/SpringCloud基础/image-20240106173935057.png)

> **注意**：如果复制JwtProperties的时候出现 Not registered via @EnableConfigurationProperties, marked as Spring component, or scanned via @ConfigurationPropertiesScan 
>
> 接着复制 SecurityConfig 就可以了。



#### 6）创建数据库

user-service也需要自己的独立的database，向MySQL中导入 `资料\hm-user.sql` 提供的SQL；执行之后数据库表如下：

![image-20240106174205654](/assets/images/Java/微服务框架/SpringCloud基础/image-20240106174205654.png)



#### 7）配置启动项

给user-service配置启动项，设置 profile 为 local：

![image-20240106174334093](/assets/images/Java/微服务框架/SpringCloud基础/image-20240106174334093.png)

#### 8）测试

启动UserApplication，访问http://localhost:8083/doc.html#/default/用户相关接口/loginUsingPOST，测试登录接口：

![image-20240106174807730](/assets/images/Java/微服务框架/SpringCloud基础/image-20240106174807730.png)

用户服务测试通过。

### 5.1.2、交易微服务

#### 1）创建trade-service模块

在hmall下新建一个module，命名为`trade-service`：

![image-20240112113212683](/assets/images/Java/微服务框架/SpringCloud基础/image-20240112113212683.png)



#### 2）添加依赖

参考 `user-service` 的依赖；`trade-service` 的`pom.xml`文件内容如下：

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.heima</groupId>
        <artifactId>hmall</artifactId>
        <version>1.0.0</version>
    </parent>

    <artifactId>trade-service</artifactId>
    <properties>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
    </properties>

    <dependencies>
        <!--common-->
        <dependency>
            <groupId>com.heima</groupId>
            <artifactId>hm-common</artifactId>
            <version>1.0.0</version>
        </dependency>
        <dependency>
            <groupId>com.heima</groupId>
            <artifactId>hm-api</artifactId>
            <version>1.0.0</version>
        </dependency>
        <!--web-->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!--数据库-->
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
        </dependency>
        <!--mybatis-->
        <dependency>
            <groupId>com.baomidou</groupId>
            <artifactId>mybatis-plus-boot-starter</artifactId>
        </dependency>
        <!--单元测试-->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
        </dependency>
        <!--nacos 服务注册发现-->
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
        </dependency>

    </dependencies>
    <build>
        <finalName>${project.artifactId}</finalName>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```



#### 3）启动类

右击 trade-service ；选择 `JBLSpringBootAppGen` 创建启动引导类如下：

![image-20240108105820646](/assets/images/Java/微服务框架/SpringCloud基础/image-20240108105820646.png)

在trade-service中的`com.hmall.trade`包下创建的启动类参考如下：

```java
package com.hmall.trade;

import com.hmall.api.config.DefaultFeignConfig;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@EnableFeignClients(basePackages = "com.hmall.api.client", defaultConfiguration = DefaultFeignConfig.class)
@MapperScan("com.hmall.trade.mapper")
@SpringBootApplication
public class TradeApplication {
    public static void main(String[] args) {
        SpringApplication.run(TradeApplication.class, args);
    }
}

```



#### 4）复制配置文件

从`hm-service`项目中复制3个yaml配置文件到`trade-service`的`resources`目录。

其中`application-dev.yaml`和`application-local.yaml`保持不变。`application.yaml`如下：

```yml
server:
  port: 8084
spring:
  application:
    name: trade-service
  cloud:
    nacos:
      server-addr: 192.168.12.168:8848    
  profiles:
    active: dev
  datasource:
    url: jdbc:mysql://${hm.db.host}:3306/hm-trade?useUnicode=true&characterEncoding=UTF-8&autoReconnect=true&serverTimezone=Asia/Shanghai
    driver-class-name: com.mysql.cj.jdbc.Driver
    username: root
    password: ${hm.db.pw}
mybatis-plus:
  configuration:
    default-enum-type-handler: com.baomidou.mybatisplus.core.handlers.MybatisEnumTypeHandler
  global-config:
    db-config:
      update-strategy: not_null
      id-type: auto
logging:
  level:
    com.hmall: debug
  pattern:
    dateformat: HH:mm:ss:SSS
  file:
    path: "logs/${spring.application.name}"
knife4j:
  enable: true
  openapi:
    title: 交易服务接口文档
    description: "交易服务接口文档"
    email: itheima@itcast.cn
    concat: itheima
    url: https://www.itcast.cn
    version: v1.0.0
    group:
      default:
        group-name: default
        api-rule: package
        api-rule-resources:
          - com.hmall.trade.controller
```



#### 5）复制代码

**① 复制基础代码**

复制hm-service中所有与order有关的代码到 `trade-service`，最终`trade-service`项目结构如下：

![image-20240108154513334](/assets/images/Java/微服务框架/SpringCloud基础/image-20240108154513334.png)



**② 改造ItemClient接口**

由于在OrderSeriviceImpl中使用到了 批量扣减库存 的接口，所以改造 `hmall\hm-api\src\main\java\com\hmall\api\client\ItemClient.java` 如下：

```java
package com.hmall.api.client;

import com.hmall.api.dto.ItemDTO;
import com.hmall.api.dto.OrderDetailDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Collection;
import java.util.List;

@FeignClient(value = "item-service")
public interface ItemClient {

    @GetMapping("/items")
    List<ItemDTO> queryItemByIds(@RequestParam("ids") Collection<Long> ids);

    @PutMapping("/items/stock/deduct")
    void deductStock(@RequestBody List<OrderDetailDTO> items);

}
```

在上述接口中使用到了 `OrderDetailDTO` 也将该类抽取到 `hm-api`模块的 `com.hmall.api.dto`包下：

![image-20240108155509530](/assets/images/Java/微服务框架/SpringCloud基础/image-20240108155509530.png)

**③ 抽取CartClient接口**

在`OrderServiceImpl`中使用到了 清空购物车 的方法；所以将购物车对应的接口抽取到 `hm-api` 模块中；定义 `hmall\hm-api\src\main\java\com\hmall\api\client\CartClient.java` 如下：

```java
package com.hmall.api.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Collection;
import java.util.List;

@FeignClient(value = "cart-service")
public interface CartClient {
    @DeleteMapping("/carts")
    void deleteCartItemByIds(@RequestParam("ids") Collection<Long> ids);

}

```

④ 改造OrderServiceImpl

接下来，就可以改造OrderServiceImpl中的逻辑，将本地方法调用改造为基于FeignClient的调用，代码参考如下：

```java
package com.hmall.trade.service.impl;

... 

@Service
@RequiredArgsConstructor
public class OrderServiceImpl extends ServiceImpl<OrderMapper, Order> implements IOrderService {

    private final ItemClient itemClient;
    private final IOrderDetailService detailService;
    private final CartClient cartClient;

    @Override
    @Transactional
    public Long createOrder(OrderFormDTO orderFormDTO) {
        // 1.订单数据
        Order order = new Order();
        // 1.1.查询商品
        List<OrderDetailDTO> detailDTOS = orderFormDTO.getDetails();
        // 1.2.获取商品id和数量的Map
        Map<Long, Integer> itemNumMap = detailDTOS.stream()
                .collect(Collectors.toMap(OrderDetailDTO::getItemId, OrderDetailDTO::getNum));
        Set<Long> itemIds = itemNumMap.keySet();
        // 1.3.查询商品
        List<ItemDTO> items = itemClient.queryItemByIds(itemIds);
        if (items == null || items.size() < itemIds.size()) {
            throw new BadRequestException("商品不存在");
        }
        // 1.4.基于商品价格、购买数量计算商品总价：totalFee
        int total = 0;
        for (ItemDTO item : items) {
            total += item.getPrice() * itemNumMap.get(item.getId());
        }
        order.setTotalFee(total);
        // 1.5.其它属性
        order.setPaymentType(orderFormDTO.getPaymentType());
        order.setUserId(UserContext.getUser());
        order.setStatus(1);
        // 1.6.将Order写入数据库order表中
        save(order);

        // 2.保存订单详情
        List<OrderDetail> details = buildDetails(order.getId(), items, itemNumMap);
        detailService.saveBatch(details);

        // 3.清理购物车商品
        cartClient.deleteCartItemByIds(itemIds);

        // 4.扣减库存
        try {
            itemClient.deductStock(detailDTOS);
        } catch (Exception e) {
            throw new RuntimeException("库存不足！");
        }
        return order.getId();
    }

    @Override
    public void markOrderPaySuccess(Long orderId) {
        Order order = new Order();
        order.setId(orderId);
        order.setStatus(2);
        order.setPayTime(LocalDateTime.now());
        updateById(order);
    }

    private List<OrderDetail> buildDetails(Long orderId, List<ItemDTO> items, Map<Long, Integer> numMap) {
        List<OrderDetail> details = new ArrayList<>(items.size());
        for (ItemDTO item : items) {
            OrderDetail detail = new OrderDetail();
            detail.setName(item.getName());
            detail.setSpec(item.getSpec());
            detail.setPrice(item.getPrice());
            detail.setNum(numMap.get(item.getId()));
            detail.setItemId(item.getId());
            detail.setImage(item.getImage());
            detail.setOrderId(orderId);
            details.add(detail);
        }
        return details;
    }
}

```



#### 6）创建数据库

trade-service也需要自己的独立的database，向MySQL中导入 `资料\hm-trade.sql` 提供的SQL；执行之后数据库表如下：

![image-20240108161414776](/assets/images/Java/微服务框架/SpringCloud基础/image-20240108161414776.png)

#### 7）配置启动项

给trade-service配置启动项，设置profile为local：

![image-20240108161600032](/assets/images/Java/微服务框架/SpringCloud基础/image-20240108161600032.png)

#### 8）测试

启动TradeApplication，访问[http://localhost:8084/doc.html](http://localhost:8084/doc.html#/default/订单管理接口/queryOrderByIdUsingGET)，测试查询订单接口：

![image-20240108162033383](/assets/images/Java/微服务框架/SpringCloud基础/image-20240108162033383.png)

请求参数：1654779387523936258，交易服务测试通过。

注意，创建订单接口无法测试，因为无法获取登录用户信息。



### 5.1.3、支付微服务

#### 1）创建pay-service模块

在hmall下新建一个module，命名为`pay-service`：

![image-20240112113256711](/assets/images/Java/微服务框架/SpringCloud基础/image-20240112113256711.png)

#### 2）添加依赖

参考 `trade-service` 的依赖；`pay-service` 的`pom.xml`文件内容如下：

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.heima</groupId>
        <artifactId>hmall</artifactId>
        <version>1.0.0</version>
    </parent>

    <artifactId>pay-service</artifactId>
    <properties>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
    </properties>

    <dependencies>
        <!--common-->
        <dependency>
            <groupId>com.heima</groupId>
            <artifactId>hm-common</artifactId>
            <version>1.0.0</version>
        </dependency>
        <dependency>
            <groupId>com.heima</groupId>
            <artifactId>hm-api</artifactId>
            <version>1.0.0</version>
        </dependency>
        <!--web-->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!--数据库-->
        <dependency>
            <groupId>mysql</groupId>
            <artifactId>mysql-connector-java</artifactId>
        </dependency>
        <!--mybatis-->
        <dependency>
            <groupId>com.baomidou</groupId>
            <artifactId>mybatis-plus-boot-starter</artifactId>
        </dependency>
        <!--单元测试-->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
        </dependency>
        <!--nacos 服务注册发现-->
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
        </dependency>

    </dependencies>
    <build>
        <finalName>${project.artifactId}</finalName>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```



#### 3）启动类

右击 pay-service ；选择 `JBLSpringBootAppGen` 创建启动引导类如下：

![image-20240108163824068](/assets/images/Java/微服务框架/SpringCloud基础/image-20240108163824068.png)

在pay-service中的`com.hmall.pay`包下创建的启动类参考如下：

```java
package com.hmall.pay;

import com.hmall.api.config.DefaultFeignConfig;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@EnableFeignClients(basePackages = "com.hmall.api.client", defaultConfiguration = DefaultFeignConfig.class)
@MapperScan("com.hmall.pay.mapper")
@SpringBootApplication
public class PayApplication {
    public static void main(String[] args) {
        SpringApplication.run(PayApplication.class, args);
    }
}

```



#### 4）复制配置文件

从`hm-service`项目中复制3个yaml配置文件到`pay-service`的`resources`目录。

其中`application-dev.yaml`和`application-local.yaml`保持不变。`application.yaml`如下：

```yml
server:
  port: 8085
spring:
  application:
    name: pay-service
  profiles:
    active: dev
  cloud:
    nacos:
      server-addr: 192.168.12.168:8848
  datasource:
    url: jdbc:mysql://${hm.db.host}:3306/hm-pay?useUnicode=true&characterEncoding=UTF-8&autoReconnect=true&serverTimezone=Asia/Shanghai
    driver-class-name: com.mysql.cj.jdbc.Driver
    username: root
    password: ${hm.db.pw}
mybatis-plus:
  configuration:
    default-enum-type-handler: com.baomidou.mybatisplus.core.handlers.MybatisEnumTypeHandler
  global-config:
    db-config:
      update-strategy: not_null
      id-type: auto
logging:
  level:
    com.hmall: debug
  pattern:
    dateformat: HH:mm:ss:SSS
  file:
    path: "logs/${spring.application.name}"
knife4j:
  enable: true
  openapi:
    title: 支付服务接口文档
    description: "支付服务接口文档"
    email: itheima@itcast.cn
    concat: itheima
    url: https://www.itcast.cn
    version: v1.0.0
    group:
      default:
        group-name: default
        api-rule: package
        api-rule-resources:
          - com.hmall.pay.controller
```



#### 5）复制代码

**① 复制基础代码**

复制hm-service中所有与pay支付有关的代码到 `pay-service`，最终`pay-service`项目结构如下：

![image-20240108172958582](/assets/images/Java/微服务框架/SpringCloud基础/image-20240108172958582.png)

在支付服务中，基于用户余额支付时需要做下列事情：

- **扣减用户余额**
- 标记支付单状态为已支付
- **标记订单状态为已支付**

其中，**扣减用户余额**是在`user-service`中有相关功能；**标记订单状态**则是在`trade-service`中有相关功能。因此交易服务要调用他们，必须通过OpenFeign远程调用。我们需要将上述功能抽取为FeignClient。



**② 抽取 UserClient接口**

在 `PayOrderServiceImpl` 中需要调用 扣减用户余额 接口；所以在 hm-api 中抽取 `hmall\hm-api\src\main\java\com\hmall\api\client\UserClient.java` 代码如下：

```java
package com.hmall.api.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient("user-service")
public interface UserClient {

    @PutMapping("/users/money/deduct")
    public void deductMoney(@RequestParam("pw") String pw, @RequestParam("amount") Integer amount);
}

```

**③ 抽取 TradeClient接口**

在 `PayOrderServiceImpl` 中需要调用 标记订单状态为已支付 接口；所以在 hm-api 中抽取 `hmall\hm-api\src\main\java\com\hmall\api\client\TradeClient.java` 代码如下：

```java
package com.hmall.api.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;

@FeignClient("trade-service")
public interface TradeClient {

    @PutMapping("/orders/{orderId}")
    public void markOrderPaySuccess(@PathVariable("orderId") Long orderId);
}

```

**④ 改造 PayOrderServiceImpl**

接下来，就可以改造 PayOrderServiceImpl 中的逻辑，将本地方法调用改造为基于FeignClient的调用，代码参考如下：

```java
package com.hmall.pay.service.impl;

import com.baomidou.mybatisplus.core.toolkit.IdWorker;
import com.baomidou.mybatisplus.core.toolkit.StringUtils;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.hmall.api.client.TradeClient;
import com.hmall.api.client.UserClient;
import com.hmall.common.exception.BizIllegalException;
import com.hmall.common.utils.BeanUtils;
import com.hmall.common.utils.UserContext;
import com.hmall.pay.domain.dto.PayApplyDTO;
import com.hmall.pay.domain.dto.PayOrderFormDTO;
import com.hmall.pay.domain.po.PayOrder;
import com.hmall.pay.enums.PayStatus;
import com.hmall.pay.mapper.PayOrderMapper;
import com.hmall.pay.service.IPayOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * <p>
 * 支付订单 服务实现类
 * </p>
 *
 * @author itheima
 * @since 2023-05-16
 */
@Service
@RequiredArgsConstructor
public class PayOrderServiceImpl extends ServiceImpl<PayOrderMapper, PayOrder> implements IPayOrderService {

    private final UserClient userClient;

    private final TradeClient tradeClient;

    @Override
    public String applyPayOrder(PayApplyDTO applyDTO) {
        // 1.幂等性校验
        PayOrder payOrder = checkIdempotent(applyDTO);
        // 2.返回结果
        return payOrder.getId().toString();
    }

    @Override
    @Transactional
    public void tryPayOrderByBalance(PayOrderFormDTO payOrderFormDTO) {
        // 1.查询支付单
        PayOrder po = getById(payOrderFormDTO.getId());
        // 2.判断状态
        if(!PayStatus.WAIT_BUYER_PAY.equalsValue(po.getStatus())){
            // 订单不是未支付，状态异常
            throw new BizIllegalException("交易已支付或关闭！");
        }
        // 3.尝试扣减余额
        userClient.deductMoney(payOrderFormDTO.getPw(), po.getAmount());
        // 4.修改支付单状态
        boolean success = markPayOrderSuccess(payOrderFormDTO.getId(), LocalDateTime.now());
        if (!success) {
            throw new BizIllegalException("交易已支付或关闭！");
        }
        // 5.修改订单状态
        tradeClient.markOrderPaySuccess(po.getBizOrderNo());
    }

    public boolean markPayOrderSuccess(Long id, LocalDateTime successTime) {
        return lambdaUpdate()
                .set(PayOrder::getStatus, PayStatus.TRADE_SUCCESS.getValue())
                .set(PayOrder::getPaySuccessTime, successTime)
                .eq(PayOrder::getId, id)
                // 支付状态的乐观锁判断
                .in(PayOrder::getStatus, PayStatus.NOT_COMMIT.getValue(), PayStatus.WAIT_BUYER_PAY.getValue())
                .update();
    }


    private PayOrder checkIdempotent(PayApplyDTO applyDTO) {
        // 1.首先查询支付单
        PayOrder oldOrder = queryByBizOrderNo(applyDTO.getBizOrderNo());
        // 2.判断是否存在
        if (oldOrder == null) {
            // 不存在支付单，说明是第一次，写入新的支付单并返回
            PayOrder payOrder = buildPayOrder(applyDTO);
            payOrder.setPayOrderNo(IdWorker.getId());
            save(payOrder);
            return payOrder;
        }
        // 3.旧单已经存在，判断是否支付成功
        if (PayStatus.TRADE_SUCCESS.equalsValue(oldOrder.getStatus())) {
            // 已经支付成功，抛出异常
            throw new BizIllegalException("订单已经支付！");
        }
        // 4.旧单已经存在，判断是否已经关闭
        if (PayStatus.TRADE_CLOSED.equalsValue(oldOrder.getStatus())) {
            // 已经关闭，抛出异常
            throw new BizIllegalException("订单已关闭");
        }
        // 5.旧单已经存在，判断支付渠道是否一致
        if (!StringUtils.equals(oldOrder.getPayChannelCode(), applyDTO.getPayChannelCode())) {
            // 支付渠道不一致，需要重置数据，然后重新申请支付单
            PayOrder payOrder = buildPayOrder(applyDTO);
            payOrder.setId(oldOrder.getId());
            payOrder.setQrCodeUrl("");
            updateById(payOrder);
            payOrder.setPayOrderNo(oldOrder.getPayOrderNo());
            return payOrder;
        }
        // 6.旧单已经存在，且可能是未支付或未提交，且支付渠道一致，直接返回旧数据
        return oldOrder;
    }

    private PayOrder buildPayOrder(PayApplyDTO payApplyDTO) {
        // 1.数据转换
        PayOrder payOrder = BeanUtils.toBean(payApplyDTO, PayOrder.class);
        // 2.初始化数据
        payOrder.setPayOverTime(LocalDateTime.now().plusMinutes(120L));
        payOrder.setStatus(PayStatus.WAIT_BUYER_PAY.getValue());
        payOrder.setBizUserId(UserContext.getUser());
        return payOrder;
    }
    public PayOrder queryByBizOrderNo(Long bizOrderNo) {
        return lambdaQuery()
                .eq(PayOrder::getBizOrderNo, bizOrderNo)
                .one();
    }
}

```



#### 6）创建数据库

pay-service也需要自己的独立的database，向MySQL中导入 `资料\hm-pay.sql` 提供的SQL；执行之后数据库表如下：

![image-20240108173829875](/assets/images/Java/微服务框架/SpringCloud基础/image-20240108173829875.png)

#### 7）配置启动项

给 pay-service 配置启动项，设置profile为local：

![image-20240108174002506](/assets/images/Java/微服务框架/SpringCloud基础/image-20240108174002506.png)

#### 8）测试

在支付服务的PayController中添加一个接口方便测试：

```Java
@ApiOperation("查询支付单")
@GetMapping
public List<PayOrderVO> queryPayOrders(){
    return BeanUtils.copyList(payOrderService.list(), PayOrderVO.class);
}
```

启动PayApplication，访问[http://localhost:8085/doc.html](http://localhost:8085/doc.html#/default/支付相关接口/queryPayOrdersUsingGET)，测试查询订单接口：

![image-20240108195425348](/assets/images/Java/微服务框架/SpringCloud基础/image-20240108195425348.png)

访问支付服务查询支付订单没有问题；测试通过。

## 5.2、前后端联调

资料中提供了一个`hmall-nginx`目录，其中包含了Nginx以及我们的前端代码：

![image-20240106164927763](/assets/images/Java/微服务框架/SpringCloud基础/image-20240106164927763.png)

将其拷贝到一个不包含中文、空格、特殊字符的目录，启动后即可访问到页面：

- 18080是用户端页面
  - [黑马商城--首页](http://localhost:18080/)
- 18081是管理端页面
  -  [用户管理](http://localhost:18081/users.html)
  - [商品管理](http://localhost:18081/items.html)

之前`nginx`内部会将发向服务端请求全部代理到8080端口，但是现在拆分了N个微服务，8080不可用了。请通过`Nginx`配置，完成对不同微服务的反向代理。