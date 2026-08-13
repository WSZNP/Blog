# RabbitMQ基础

微服务一旦拆分，必然涉及到服务之间的相互调用，目前我们服务之间调用采用的都是基于OpenFeign的调用。这种调用中，调用者发起请求后需要**等待**服务提供者执行业务返回结果后，才能继续执行后面的业务。也就是说调用者在调用过程中处于阻塞状态，因此我们成这种调用方式为**同步调用**，也可以叫**同步通讯**。但在很多场景下，我们可能需要采用**异步通讯**的方式，为什么呢？

我们先来看看什么是同步通讯和异步通讯。如图：

![async-comu](/assets/images/Java/微服务框架/RabbitMQ-基础/async-comu.png)

解读：

- 同步通讯：就如同打视频电话，双方的交互都是实时的。因此同一时刻你只能跟一个人打视频电话。
- 异步通讯：就如同发微信聊天，双方的交互不是实时的，你不需要立刻给对方回应。因此你可以多线操作，同时跟多人聊天。

两种方式各有优劣，打电话可以立即得到响应，但是你却不能跟多个人同时通话。发微信可以同时与多个人收发微信，但是往往响应会有延迟。

所以，如果我们的业务需要实时得到服务提供方的响应，则应该选择同步通讯（同步调用）。而如果我们追求更高的效率，并且不需要实时响应，则应该选择异步通讯（异步调用）。

同步调用的方式我们已经学过了，之前的OpenFeign调用就是。但是：

- 异步调用又该如何实现？
- 哪些业务适合用异步调用来实现呢？

通过今天的学习你就能明白这些问题了。

# 1、初识MQ

## 1.1、同步调用

之前说过，我们现在基于OpenFeign的调用都属于是同步调用，那么这种方式存在哪些问题呢？

举个例子，我们以 黑马商城的**余额支付功能**为例来分析，首先看下整个流程：

![image-20240117195908270](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240117195908270.png)

目前我们采用的是基于OpenFeign的同步调用，也就是说业务执行流程是这样的：

- 支付服务需要先调用用户服务完成余额扣减
- 然后支付服务自己要更新支付流水单的状态
- 然后支付服务调用交易服务，更新业务订单状态为已支付

三个步骤依次执行。

这其中就存在3个问题：

**第一**，**拓展性差**

我们目前的业务相对简单，但是随着业务规模扩大，产品的功能也在不断完善。

在大多数电商业务中，用户支付成功后都会以短信或者其它方式通知用户，告知支付成功。假如后期产品经理提出这样新的需求，你怎么办？是不是要在上述业务中再加入通知用户的业务？

某些电商项目中，还会有积分或金币的概念。假如产品经理提出需求，用户支付成功后，给用户以积分奖励或者返还金币，你怎么办？是不是要在上述业务中再加入积分业务、返还金币业务？

。。。

最终你的支付业务会越来越臃肿：

![feign-sync-full](/assets/images/Java/微服务框架/RabbitMQ-基础/feign-sync-full.png)

也就是说每次有新的需求，现有支付逻辑都要跟着变化，代码经常变动，不符合开闭原则，拓展性不好。

**第二**，**性能下降**

由于我们采用了同步调用，调用者需要等待服务提供者执行完返回结果后，才能继续向下执行，也就是说每次远程调用，调用者都是阻塞等待状态。最终整个业务的响应时长就是每次远程调用的执行时长之和：

![sync-feign-consume-time](/assets/images/Java/微服务框架/RabbitMQ-基础/sync-feign-consume-time.png)

假如每个微服务的执行时长都是50ms，则最终整个业务的耗时可能高达300ms，性能太差了。

**第三，级联失败**

由于我们是基于OpenFeign调用交易服务、通知服务。当交易服务、通知服务出现故障时，整个事务都会回滚，交易失败。

这其实就是同步调用的**级联失败**问题。

但是大家思考一下，我们假设用户余额充足，扣款已经成功，此时我们应该确保支付流水单更新为已支付，确保交易成功。毕竟收到手里的钱没道理再退回去吧。

因此，这里不能因为短信通知、更新订单状态失败而回滚整个事务。

综上，同步调用的方式存在下列问题：

- 拓展性差
- 性能下降
- 级联失败

而要解决这些问题，我们就必须用**异步调用**的方式来代替**同步调用**。

## 1.2、异步调用

异步调用方式其实就是基于消息通知的方式，一般包含三个角色：

- 消息发送者：投递消息的人，就是原来的调用方
- 消息Broker：管理、暂存、转发消息，你可以把它理解成微信服务器
- 消息接收者：接收和处理消息的人，就是原来的服务提供方

![image-20240117201116225](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240117201116225.png)

在异步调用中，发送者不再直接同步调用接收者的业务接口，而是发送一条消息投递给消息Broker。然后接收者根据自己的需求从消息Broker那里订阅消息。每当发送方发送消息后，接受者都能获取消息并处理。

这样，发送消息的人和接收消息的人就完全解耦了。

还是以余额支付业务为例：

![image-20240117201306898](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240117201306898.png)

除了扣减余额、更新支付流水单状态以外，其它调用逻辑全部取消。而是改为发送一条消息到Broker。而相关的微服务都可以订阅消息通知，一旦消息到达Broker，则会分发给每一个订阅了的微服务，处理各自的业务。

假如产品经理提出了新的需求，比如要在支付成功后更新用户积分。支付代码完全不用变更，而仅仅是让积分服务也订阅消息即可：

![image-20240117201403765](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240117201403765.png)

不管后期增加了多少消息订阅者，作为支付服务来讲，执行问扣减余额、更新支付流水状态后，发送消息即可。业务耗时仅仅是这三部分业务耗时，仅仅100ms，大大提高了业务性能。

另外，不管是交易服务、通知服务，还是积分服务，他们的业务与支付关联度低。现在采用了异步调用，解除了耦合，他们即便执行过程中出现了故障，也不会影响到支付服务。

综上，异步调用的优势包括：

- 耦合度更低
- 性能更好
- 业务拓展性强
- 故障隔离，避免级联失败

当然，异步通信也并非完美无缺，它存在下列缺点：

- 完全依赖于Broker的可靠性、安全性和性能
- 架构复杂，后期维护和调试麻烦

## 1.3、技术选型

消息Broker，目前常见的实现方案就是消息队列（MessageQueue），简称为MQ.

目比较常见的MQ实现：

- ActiveMQ
- RabbitMQ
- RocketMQ
- Kafka

几种常见MQ的对比：

|            | RabbitMQ                | ActiveMQ                       | RocketMQ   | Kafka          |
| ---------- | ----------------------- | ------------------------------ | ---------- | -------------- |
| 公司/社区  | Rabbit                  | Apache                         | 阿里       | Apache         |
| 开发语言   | Erlang                  | Java                           | Java       | Scala&Java     |
| 协议支持   | AMQP，XMPP，SMTP，STOMP | OpenWire,STOMP，REST,XMPP,AMQP | 自定义协议 | 自定义协议     |
| 可用性     | 高                      | 一般                           | 高         | 高             |
| 单机吞吐量 | 一般；几十万每秒        | 差；10w/s                      | 高；100w/s | 非常高；100w/s |
| 消息延迟   | 微秒级                  | 毫秒级                         | 毫秒级     | 毫秒以内       |
| 消息可靠性 | 高                      | 一般                           | 高         | 一般           |

追求可用性：Kafka、 RocketMQ 、RabbitMQ

追求可靠性：RabbitMQ、RocketMQ

追求吞吐能力：RocketMQ、Kafka

追求消息低延迟：RabbitMQ、Kafka

据统计，目前国内消息队列使用最多的还是RabbitMQ，再加上其各方面都比较均衡，稳定性也好，因此我们课堂上选择RabbitMQ来学习。

# 2、RabbitMQ

## 2.1、安装

我们同样基于Docker来安装RabbitMQ，使用下面的命令即可：

```Shell
docker run \
 -e RABBITMQ_DEFAULT_USER=itheima \
 -e RABBITMQ_DEFAULT_PASS=123321 \
 -v mq-plugins:/plugins \
 --name mq \
 --hostname mq \
 -p 15672:15672 \
 -p 5672:5672 \
 --network hm-net\
 -d \
 rabbitmq:3.8-management
```

> 注意：
>
> 如果拉取镜像困难的话，可以使用 `资料/mq.tar` 给大家准备的镜像，利用docker load -i mq.tar 命令加载

可以看到在安装命令中有两个映射的端口：

- 15672：RabbitMQ提供的管理控制台的端口
- 5672：RabbitMQ的消息发送处理接口

安装完成后，我们访问 http://192.168.12.168:15672即可看到管理控制台。首次访问需要登录，默认的用户名和密码在安装命令中已经指定了（itheima/123321）。

登录后即可看到管理控制台总览页面：

![image-20240117202742227](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240117202742227.png)

RabbitMQ对应的架构如图：

![image-20240117202812485](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240117202812485.png)

其中包含几个概念：

- **`publisher`**：生产者，也就是发送消息的一方
- **`consumer`**：消费者，也就是消费消息的一方
- **`queue`**：队列，存储消息。生产者投递的消息会暂存在消息队列中，等待消费者处理
- **`exchange`**：交换机，负责消息路由。生产者发送的消息由交换机决定投递到哪个队列。
- **`virtual host`**：虚拟主机，起到数据隔离的作用。每个虚拟主机相互独立，有各自的exchange、queue

上述这些东西都可以在RabbitMQ的管理控制台来管理，下一节我们就一起来学习控制台的使用。

## 2.2、收发消息

### 2.2.1、交换机

我们打开Exchanges选项卡，可以看到已经存在很多交换机：

![image-20240117203135876](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240117203135876.png)

我们点击任意交换机，即可进入交换机详情页面。仍然可利用控制台中的publish message 发送一条消息：

![image-20240117203242652](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240117203242652.png)

![image-20240117203421018](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240117203421018.png)

![image-20240117203513043](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240117203513043.png)

这里是由控制台模拟了生产者发送的消息。由于没有路由到队列存储，最终消息丢失了，这样说明交换机没有存储消息的能力。

### 2.2.2、队列

我们打开`Queues`选项卡，新建一个队列：

![image-20240117203640093](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240117203640093.png)

命名为`hello.queue1`：

![image-20240117203805941](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240117203805941.png)

再以相同的方式，创建一个队列，命名为`hello.queue2`，最终队列列表如下：

![image-20240117203927896](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240117203927896.png)

此时，我们再次向`amq.fanout`交换机发送一条消息。会发现消息依然没有到达队列！！

怎么回事呢？

发送到交换机的消息，只会路由到与其绑定的队列，因此仅仅创建队列是不够的，我们还需要将其与交换机绑定。

### 2.2.3、绑定关系

点击`Exchanges`选项卡，点击`amq.fanout`交换机，进入交换机详情页，然后点击`Bindings`菜单，在表单中填写要绑定的队列名称：

![image-20240117204244785](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240117204244785.png)

相同的方式，将hello.queue2也绑定到该交换机。

最终，绑定结果如下：

![image-20240117204358957](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240117204358957.png)

### 2.2.4、发送消息

再次回到exchange页面，找到刚刚绑定的`amq.fanout`，点击进入详情页，再次发送一条消息：

![image-20240117203421018](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240117203421018.png)

回到`Queues`选项卡页面，可以发现`hello.queue`中都已经有一条消息了：

![image-20240117204616690](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240117204616690.png)

点击队列名称，进入详情页，查看队列详情，这次我们点击get message：

![image-20240117204743786](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240117204743786.png)

可以看到消息到达队列了：

![image-20240117205819321](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240117205819321.png)

这个时候如果有消费者监听了MQ的`hello.queue1`或`hello.queue2`队列，自然就能接收到消息了。

## 2.3、数据隔离

### 2.3.1、用户管理

点击`Admin`选项卡，首先会看到RabbitMQ控制台的用户管理界面：

![image-20240117210341924](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240117210341924.png)

这里的用户都是RabbitMQ的管理或运维人员。目前只有安装RabbitMQ时添加的`itheima`这个用户。仔细观察用户表格中的字段，如下：

- `Name`：`itheima`，也就是用户名
- `Tags`：`administrator`，说明`itheima`用户是超级管理员，拥有所有权限
- `Can access virtual host`： `/`，可以访问的`virtual host`，这里的`/`是默认的`virtual host`

对于小型企业而言，出于成本考虑，我们通常只会搭建一套MQ集群，公司内的多个不同项目同时使用。这个时候为了避免互相干扰， 我们会利用`virtual host`的隔离特性，将不同项目隔离。一般会做两件事情：

- 给每个项目创建独立的运维账号，将管理权限分离。
- 给每个项目创建不同的`virtual host`，将每个项目的数据隔离。

比如，我们给黑马商城创建一个新的用户，命名为`hmall`，密码123：

![image-20240117210606976](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240117210606976.png)

你会发现此时hmall用户没有任何`Virtual host`的访问权限：

![image-20240117210658335](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240117210658335.png)

别急，接下来我们就来授权。

### 2.3.2、Virtual host

我们先退出登录：

![image-20240117210832341](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240117210832341.png)

切换到刚刚创建的hmall用户登录，密码为123，然后点击`Virtual Hosts`菜单，进入`virtual host`管理页：

![image-20240117211009457](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240117211009457.png)

可以看到目前只有一个默认的`virtual host`，名字为 `/`。

我们可以给黑马商城项目创建一个单独的`virtual host`，而不是使用默认的`/`；新建起名为 `/hmall`

![image-20240117211319635](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240117211319635.png)

创建完成后如图：

![image-20240117211403538](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240117211403538.png)

由于我们是登录`hmall`账户后创建的`virtual host`，因此回到`users`菜单，你会发现当前用户已经具备了对`/hmall`这个`virtual host`的访问权限了：

![image-20240117211552154](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240117211552154.png)

此时，点击页面右上角的`virtual host`下拉菜单，切换`virtual host`为 `/hmall`：

![image-20240117211700889](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240117211700889.png)

然后再次查看queues选项卡，会发现之前的队列已经看不到了：

![image-20240117211831719](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240117211831719.png)

这就是基于`virtual host `的隔离效果。

# 3、SpringAMQP

将来我们开发业务功能的时候，肯定不会在控制台收发消息，而是应该基于编程的方式。由于`RabbitMQ`采用了AMQP协议，因此它具备跨语言的特性。任何语言只要遵循AMQP协议收发消息，都可以与`RabbitMQ`交互。并且`RabbitMQ`官方也提供了各种不同语言的客户端。

但是，RabbitMQ官方提供的Java客户端编码相对复杂，一般生产环境下我们更多会结合Spring来使用。而Spring的官方刚好基于RabbitMQ提供了这样一套消息收发的模板工具：SpringAMQP。并且还基于SpringBoot对其实现了自动装配，使用起来非常方便。

SpringAmqp的官方地址：

https://spring.io/projects/spring-amqp

SpringAMQP提供了三个功能：

- 自动声明队列、交换机及其绑定关系
- 基于注解的监听器模式，异步接收消息
- 封装了RabbitTemplate工具，用于发送消息

这一章我们就一起学习一下，如何利用SpringAMQP实现对RabbitMQ的消息收发。

## 3.1、导入Demo工程

在`资料\mq-demo`是给大家提供的一个Demo工程，方便我们学习SpringAMQP的使用：将其复制到自己的工作空间，然后使用IDEA独立打开，项目结构如下：

![image-20240118101744244](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240118101744244.png)

包括三部分：

- mq-demo：父工程，管理项目依赖
- publisher：消息的发送者
- consumer：消息的消费者

在mq-demo这个父工程中，已经配置好了SpringAMQP相关的依赖：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>cn.itcast.demo</groupId>
    <artifactId>mq-demo</artifactId>
    <version>1.0-SNAPSHOT</version>
    <modules>
        <module>publisher</module>
        <module>consumer</module>
    </modules>
    <packaging>pom</packaging>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>2.7.12</version>
        <relativePath/>
    </parent>

    <properties>
        <maven.compiler.source>8</maven.compiler.source>
        <maven.compiler.target>8</maven.compiler.target>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
        </dependency>
        <!--AMQP依赖，包含RabbitMQ-->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-amqp</artifactId>
        </dependency>
        <!--单元测试-->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
        </dependency>
    </dependencies>
</project>
```

因此，子工程中就可以直接使用SpringAMQP了。

## 3.2、快速入门

在之前的案例中，我们都是经过交换机发送消息到队列，不过有时候为了测试方便，我们也可以直接向队列发送消息，跳过交换机。

在入门案例中，我们就演示这样的简单模型，如图：

![image-20240118102342211](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240118102342211.png)

也就是：

- publisher直接发送消息到队列
- 消费者监听并处理队列中的消息

> **注意**：这种模式一般测试使用，很少在生产中使用。

为了方便测试，我们在rabbitMQ控制台使用 hmall/123登录；新建一个队列：`simple.queue`

![image-20240118102654128](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240118102654128.png)

添加队列之后：

![image-20240118102745852](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240118102745852.png)

接下来，我们就可以利用Java代码收发消息了。

### 3.2.1、消息发送

首先配置MQ地址，在 `mq-demo\publisher\src\main\resources\application.yml` 中添加配置：

```YAML
spring:
  rabbitmq:
    host: 192.168.12.168 # 你的虚拟机IP
    port: 5672 # 端口
    virtual-host: /hmall # 虚拟主机
    username: hmall # 用户名
    password: 123 # 密码
```

然后在`publisher`服务中编写测试类`mq-demo\publisher\src\test\java\com\itheima\publisher\amqp\SpringAmqpTest.java`，并利用`RabbitTemplate`实现消息发送：

```Java
package com.itheima.publisher.amqp;

import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class SpringAmqpTest {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Test
    public void testSimpleQueue() {
        // 队列名称
        String queueName = "simple.queue";
        // 消息
        String message = "hello, spring amqp!";
        // 发送消息
        rabbitTemplate.convertAndSend(queueName, message);
    }
}
```

打开控制台，可以看到消息已经发送到队列中：

![image-20240118104019779](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240118104019779.png)

接下来，我们再来实现消息接收。

### 3.2.2、消息接收

首先配置MQ地址，在 `mq-demo\consumer\src\main\resources\application.yml` 中添加配置：

```yml
spring:
  rabbitmq:
    host: 192.168.12.168 # 你的虚拟机IP
    port: 5672 # 端口
    virtual-host: /hmall # 虚拟主机
    username: hmall # 用户名
    password: 123 # 密码
```

然后在`consumer`服务中编写消息监听器类`mq-demo\consumer\src\main\java\com\itheima\consumer\listener\SpringRabbitListener.java`，并利用`@RabbitListener`实现消息接收消费：

```java
package com.itheima.consumer.listener;

import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class SpringRabbitListener {

    /*
    利用@RabbitListener注解，可以监听到对应队列的消息
    一旦监听的队列有消息，就会回调当前方法，在方法中接收消息并消费处理消息
     */
    @RabbitListener(queues = "simple.queue")
    public void listenSimpleQueueMessage(String message) throws Exception {
        System.out.println("SpringRabbitListener listenSimpleQueueMessage 消费者接收到消息: " + message);
    }
}

```

### 3.2.3、测试

**启动 consumer 服务**（运行`com.itheima.consumer.ConsumerApplication`），然后在 publisher 服务中运行测试代码，发送MQ消息。最终 consumer 的控制台收到消息：

![image-20240118105322871](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240118105322871.png)

## 3.3、WorkQueue模型

Work queues，任务模型。简单来说就是**让多个消费者绑定到一个队列，共同消费队列中的消息**。

![image-20240118105815703](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240118105815703.png)

当消息处理比较耗时的时候，可能生产消息的速度会远远大于消息的消费速度。长此以往，消息就会堆积越来越多，无法及时处理。

此时就可以使用work 模型，**多个消费者共同处理消息处理，消息处理的速度就能大大提高**了。

接下来，我们就来模拟这样的场景。

首先，我们在控制台创建一个新的队列，命名为`work.queue`：

![image-20240118110500338](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240118110500338.png)

### 3.3.1、消息发送

这次我们循环发送，模拟大量消息堆积现象。

在publisher服务中的SpringAmqpTest类中添加一个测试方法：

```java
    /*
    测试 work queue；
    向队列发送大量消息，模拟消息堆积
     */
    @Test
    public void testWorkQueue() throws InterruptedException {
        //队列名称
        String queueName = "work.queue";
        //发送的内容
        String message = "hello spring amqp-";
        //发送消息
        for (int i = 0; i < 50; i++) {
            //发送消息，每20毫秒发送一次，相当于每秒发送50条消息
            rabbitTemplate.convertAndSend(queueName, message + i);
            Thread.sleep(20);
        }
    }

```

### 3.3.2、消息接收

要模拟多个消费者绑定同一个队列，我们在consumer服务的SpringRabbitListener中添加2个新的方法：

```java
    /*
    实现两个消费 work.queue的监听消费消息的方法；
    一个方法消费后沉睡 20毫秒；一个消息消费后沉睡200毫秒；
     */
    @RabbitListener(queues = "work.queue")
    public void listenWorkQueueMessage1(String message) throws Exception {
        System.out.println("消费者1接收到消息: " + message + " " + LocalTime.now());
        try {
            Thread.sleep(20);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
    @RabbitListener(queues = "work.queue")
    public void listenWorkQueueMessage2(String message) throws Exception {
        System.out.println("---消费者2接收到消息: " + message + " " + LocalTime.now());
        try {
            Thread.sleep(200);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
```

注意到这两消费者，都设置了`Thead.sleep`，模拟任务耗时：

- 消费者1 sleep了20毫秒，相当于每秒钟处理50个消息
- 消费者2 sleep了200毫秒，相当于每秒处理5个消息

### 3.3.3、测试

启动ConsumerApplication后，在执行publisher服务中刚刚编写的发送测试方法testWorkQueue。

最终结果如下：

```java
消费者1接收到消息: hello spring amqp-0 11:24:24.787809800
---消费者2接收到消息: hello spring amqp-1 11:24:24.807283500
消费者1接收到消息: hello spring amqp-2 11:24:24.836230400
消费者1接收到消息: hello spring amqp-4 11:24:24.896896900
消费者1接收到消息: hello spring amqp-6 11:24:24.957069600
---消费者2接收到消息: hello spring amqp-3 11:24:25.015662300
消费者1接收到消息: hello spring amqp-8 11:24:25.019604
消费者1接收到消息: hello spring amqp-10 11:24:25.079168800
消费者1接收到消息: hello spring amqp-12 11:24:25.140233
消费者1接收到消息: hello spring amqp-14 11:24:25.199038600
---消费者2接收到消息: hello spring amqp-5 11:24:25.226963500
消费者1接收到消息: hello spring amqp-16 11:24:25.258879400
消费者1接收到消息: hello spring amqp-18 11:24:25.319741800
消费者1接收到消息: hello spring amqp-20 11:24:25.381594
---消费者2接收到消息: hello spring amqp-7 11:24:25.437784900
消费者1接收到消息: hello spring amqp-22 11:24:25.439736100
消费者1接收到消息: hello spring amqp-24 11:24:25.501622200
消费者1接收到消息: hello spring amqp-26 11:24:25.563375200
消费者1接收到消息: hello spring amqp-28 11:24:25.623740100
---消费者2接收到消息: hello spring amqp-9 11:24:25.650424100
消费者1接收到消息: hello spring amqp-30 11:24:25.681340300
消费者1接收到消息: hello spring amqp-32 11:24:25.741924200
消费者1接收到消息: hello spring amqp-34 11:24:25.802402500
---消费者2接收到消息: hello spring amqp-11 11:24:25.861841300
消费者1接收到消息: hello spring amqp-36 11:24:25.862839700
消费者1接收到消息: hello spring amqp-38 11:24:25.924258100
消费者1接收到消息: hello spring amqp-40 11:24:25.985593200
消费者1接收到消息: hello spring amqp-42 11:24:26.046299200
---消费者2接收到消息: hello spring amqp-13 11:24:26.072328300
消费者1接收到消息: hello spring amqp-44 11:24:26.104115900
消费者1接收到消息: hello spring amqp-46 11:24:26.164211200
消费者1接收到消息: hello spring amqp-48 11:24:26.224457700
---消费者2接收到消息: hello spring amqp-15 11:24:26.285312500
---消费者2接收到消息: hello spring amqp-17 11:24:26.495175600
---消费者2接收到消息: hello spring amqp-19 11:24:26.705651800
---消费者2接收到消息: hello spring amqp-21 11:24:26.915489400
---消费者2接收到消息: hello spring amqp-23 11:24:27.127155200
---消费者2接收到消息: hello spring amqp-25 11:24:27.339142
---消费者2接收到消息: hello spring amqp-27 11:24:27.551129700
---消费者2接收到消息: hello spring amqp-29 11:24:27.761478100
---消费者2接收到消息: hello spring amqp-31 11:24:27.971931500
---消费者2接收到消息: hello spring amqp-33 11:24:28.182168900
---消费者2接收到消息: hello spring amqp-35 11:24:28.393535100
---消费者2接收到消息: hello spring amqp-37 11:24:28.605538500
---消费者2接收到消息: hello spring amqp-39 11:24:28.815968900
---消费者2接收到消息: hello spring amqp-41 11:24:29.030141500
---消费者2接收到消息: hello spring amqp-43 11:24:29.242498200
---消费者2接收到消息: hello spring amqp-45 11:24:29.454128100
---消费者2接收到消息: hello spring amqp-47 11:24:29.665901600
---消费者2接收到消息: hello spring amqp-49 11:24:29.877815700

```

可以看到消费者1和消费者2竟然每人消费了25条消息：

- 消费者1很快完成了自己的25条消息
- 消费者2却在缓慢的处理自己的25条消息。

也就是说消息是平均分配给每个消费者，并没有考虑到消费者的处理能力。导致1个消费者空闲，另一个消费者忙的不可开交。没有充分利用每一个消费者的能力，最终消息处理的耗时远远超过了1秒。这样显然是有问题的。

### 3.3.4、能者多劳

在spring中有一个简单的配置，可以解决这个问题。我们修改 `mq-demo\consumer\src\main\resources\application.yml` 文件，添加配置：

```yml
spring:
  rabbitmq:
    listener:
      simple:
        prefetch: 1 # 每次只能获取一条消息，处理完成才能获取下一个消息
```

再次测试，发现结果如下：

```java
消费者1接收到消息: hello spring amqp-0 11:27:41.514035500
---消费者2接收到消息: hello spring amqp-1 11:27:41.529992500
消费者1接收到消息: hello spring amqp-2 11:27:41.559582300
消费者1接收到消息: hello spring amqp-3 11:27:41.604471
消费者1接收到消息: hello spring amqp-4 11:27:41.634381500
消费者1接收到消息: hello spring amqp-5 11:27:41.664301200
消费者1接收到消息: hello spring amqp-6 11:27:41.693305300
消费者1接收到消息: hello spring amqp-7 11:27:41.723233500
---消费者2接收到消息: hello spring amqp-8 11:27:41.739188900
消费者1接收到消息: hello spring amqp-9 11:27:41.768110400
消费者1接收到消息: hello spring amqp-10 11:27:41.798037200
消费者1接收到消息: hello spring amqp-11 11:27:41.828947700
消费者1接收到消息: hello spring amqp-12 11:27:41.858884300
消费者1接收到消息: hello spring amqp-13 11:27:41.890843600
消费者1接收到消息: hello spring amqp-14 11:27:41.916843
消费者1接收到消息: hello spring amqp-15 11:27:41.950723200
---消费者2接收到消息: hello spring amqp-16 11:27:41.978647100
消费者1接收到消息: hello spring amqp-17 11:27:42.008561800
消费者1接收到消息: hello spring amqp-18 11:27:42.037484700
消费者1接收到消息: hello spring amqp-19 11:27:42.067412300
消费者1接收到消息: hello spring amqp-20 11:27:42.098323100
消费者1接收到消息: hello spring amqp-21 11:27:42.128242900
消费者1接收到消息: hello spring amqp-22 11:27:42.157168200
消费者1接收到消息: hello spring amqp-23 11:27:42.187616200
---消费者2接收到消息: hello spring amqp-24 11:27:42.218532800
消费者1接收到消息: hello spring amqp-25 11:27:42.249438
消费者1接收到消息: hello spring amqp-26 11:27:42.276425400
消费者1接收到消息: hello spring amqp-27 11:27:42.307335900
消费者1接收到消息: hello spring amqp-28 11:27:42.339207900
消费者1接收到消息: hello spring amqp-29 11:27:42.369361400
消费者1接收到消息: hello spring amqp-30 11:27:42.399280400
消费者1接收到消息: hello spring amqp-31 11:27:42.427761
---消费者2接收到消息: hello spring amqp-32 11:27:42.459682800
消费者1接收到消息: hello spring amqp-33 11:27:42.488625100
消费者1接收到消息: hello spring amqp-34 11:27:42.518780900
消费者1接收到消息: hello spring amqp-35 11:27:42.550181
消费者1接收到消息: hello spring amqp-36 11:27:42.580102400
消费者1接收到消息: hello spring amqp-37 11:27:42.609109700
消费者1接收到消息: hello spring amqp-38 11:27:42.641034600
消费者1接收到消息: hello spring amqp-39 11:27:42.668428300
---消费者2接收到消息: hello spring amqp-40 11:27:42.697812900
消费者1接收到消息: hello spring amqp-41 11:27:42.728719500
消费者1接收到消息: hello spring amqp-42 11:27:42.758637300
消费者1接收到消息: hello spring amqp-43 11:27:42.788564100
消费者1接收到消息: hello spring amqp-44 11:27:42.818993900
消费者1接收到消息: hello spring amqp-45 11:27:42.849912400
消费者1接收到消息: hello spring amqp-46 11:27:42.879830500
消费者1接收到消息: hello spring amqp-47 11:27:42.908752500
---消费者2接收到消息: hello spring amqp-48 11:27:42.938674400
消费者1接收到消息: hello spring amqp-49 11:27:42.968593500

```

可以发现，由于消费者1处理速度较快，所以处理了更多的消息；消费者2处理速度较慢，只处理了7条消息。而最终总的执行耗时也在1秒左右，大大提升。

正所谓能者多劳，这样充分利用了每一个消费者的处理能力，可以有效避免消息积压问题。

### 3.3.5、总结

Work模型的使用：

- 多个消费者绑定到一个队列，同一条消息只会被一个消费者处理
- 通过设置prefetch来控制消费者预取的消息数量

## 3.4、交换机类型

在之前的两个测试案例中，都没有交换机Exchange，生产者直接发送消息到队列。而一旦引入交换机，消息发送的模式会有很大变化：

![image-20240118113134108](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240118113134108.png)

可以看到，在订阅模型中，多了一个exchange角色，而且过程略有变化：

- **Publisher**：生产者，不再发送消息到队列中，而是发给交换机
- **Exchange**：交换机，一方面，接收生产者发送的消息。另一方面，知道如何处理消息，例如递交给某个特别队列、递交给所有队列、或是将消息丢弃。到底如何操作，取决于Exchange的类型。
- **Queue**：消息队列也与以前一样，接收消息、缓存消息。不过队列一定要与交换机绑定。
- **Consumer**：消费者，与以前一样，订阅队列，没有变化

**Exchange（交换机）只负责转发消息，不具备存储消息的能力**，因此如果没有任何队列与Exchange绑定，或者没有符合路由规则的队列，那么消息会丢失！

交换机的类型有四种：

- **Fanout**：广播，将消息交给所有绑定到交换机的队列。我们最早在控制台使用的正是Fanout交换机
- **Direct**：订阅，基于RoutingKey（路由key）发送给订阅了消息的队列
- **Topic**：通配符订阅，与Direct类似，只不过RoutingKey可以使用通配符
- **Headers**：头匹配，基于MQ的消息头匹配，用的较少

课堂中，我们讲解前面的三种交换机模式。

## 3.5、Fanout交换机

Fanout，英文翻译是扇出，我觉得在MQ中叫广播更合适。

在广播模式下，消息发送流程是这样的：

![image-20240118141322408](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240118141322408.png)

- 1） 可以有多个队列
- 2） 每个队列都要绑定到Exchange（交换机）
- 3） 生产者发送的消息，只能发送到交换机
- 4） 交换机把消息发送给绑定过的所有队列
- 5） 订阅队列的消费者都能拿到消息

我们的计划是这样的：

![image-20240118141419523](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240118141419523.png)

- 创建一个名为` hmall.fanout`的交换机，类型是`Fanout`
- 创建两个队列`fanout.queue1`和`fanout.queue2`，绑定到交换机`hmall.fanout`

### 3.5.1、声明队列和交换机

在控制台创建队列`fanout.queue1`、`fanout.queue2`：

![image-20240118142215951](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240118142215951.png)

然后再创建一个交换机：

![image-20240118142410795](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240118142410795.png)

![image-20240118142503957](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240118142503957.png)

然后绑定两个队列到交换机：

![image-20240118142643626](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240118142643626.png)

![image-20240118142734822](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240118142734822.png)

### 3.5.2、消息发送

在publisher服务的SpringAmqpTest类中添加测试方法：

```java
    /*
    测试 fanout exchange；
    向 hmall.fanout 交换机发送消息，消息内容为 hello everyone!，会发送到所有绑定到该交换机的队列
     */
    @Test
    public void testFanoutExchange() {
        //交换机名称
        String exchangeName = "hmall.fanout";
        //发送的内容
        String message = "hello everyone!";
        //发送消息
        rabbitTemplate.convertAndSend(exchangeName, "", message);
    }
```

> **注意**：上述的 convertAndSend 方法的第2个参数：路由key 因为没有绑定，所以可以指定为空

### 3.5.3、消息接收

在consumer服务的SpringRabbitListener中添加两个方法，作为消费者：

```java
    /*
    监听 fanout.queue1 队列的消息
     */
    @RabbitListener(queues = "fanout.queue1")
    public void listenFanoutQueue1(String message) {
        System.out.println("【消费者1】接收到消息: " + message );
    }
    /*
    监听 fanout.queue2 队列的消息
     */
    @RabbitListener(queues = "fanout.queue2")
    public void listenFanoutQueue2(String message) {
        System.out.println("【消费者2】接收到消息: " + message );
    }
```

### 3.5.4、总结

交换机的作用是什么？

- 接收publisher发送的消息
- 将消息按照规则路由到与之绑定的队列
- 不能缓存消息，路由失败，消息丢失
- FanoutExchange的会将消息路由到每个绑定的队列

## 3.6、Direct交换机

在Fanout模式中，一条消息，会被所有订阅的队列都消费。但是，在某些场景下，我们希望不同的消息被不同的队列消费。这时就要用到Direct类型的Exchange。

![image-20240118144629121](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240118144629121.png)

在Direct模型下：

- 队列与交换机的绑定，不能是任意绑定了，而是要指定一个`RoutingKey`（路由key）
- 消息的发送方在 向 Exchange发送消息时，也必须指定消息的 `RoutingKey`。
- Exchange不再把消息交给每一个绑定的队列，而是根据消息的`Routing Key`进行判断，只有队列的`Routingkey`与消息的 `Routing key`完全一致，才会接收到消息

**案例需求如图**：

![image-20240118145343283](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240118145343283.png)

1.  声明一个名为`hmall.direct`的交换机
2.  声明队列`direct.queue1`，绑定`hmall.direct`，`bindingKey`为`blud`和`red`
3.  声明队列`direct.queue2`，绑定`hmall.direct`，`bindingKey`为`yellow`和`red`
4.  在`consumer`服务中，编写两个消费者方法，分别监听direct.queue1和direct.queue2
5.  在publisher中编写测试方法，向`hmall.direct`发送消息

### 3.6.1、声明队列和交换机

首先在控制台声明两个队列`direct.queue1`和`direct.queue2`，这里不再展示过程：

![image-20240118145709213](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240118145709213.png)

然后声明一个direct类型的交换机，命名为`hmall.direct`:

![image-20240118145828824](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240118145828824.png)

然后使用`red`和`blue`作为key，绑定`direct.queue1`到`hmall.direct`：

![image-20240118150133855](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240118150133855.png)

![image-20240118150313817](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240118150313817.png)

同理，使用`red`和`yellow`作为key，绑定`direct.queue2`到`hmall.direct`，步骤略，最终结果：

![image-20240118150430342](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240118150430342.png)

### 3.6.2、消息接收

在consumer服务的SpringRabbitListener中添加方法：

```java
    /*
    监听 direct.queue1 队列的消息
     */
    @RabbitListener(queues = "direct.queue1")
    public void listenDirectQueue1(String message) {
        System.out.println("【消费者1】接收到消息: " + message );
    }
    /*
    监听 direct.queue2 队列的消息
     */
    @RabbitListener(queues = "direct.queue2")
    public void listenDirectQueue2(String message) {
        System.out.println("【消费者2】接收到消息: " + message );
    }

```

### 3.6.3、消息发送

在publisher服务的SpringAmqpTest类中添加测试方法：

```java
    /*
    测试 direct exchange；
    向 hmall.direct 交换机发送消息，会根据路由key发送到所有绑定到该交换机的队列
     */
    @Test
    public void testDirectExchange() {
        String exchangeName = "hmall.direct";
        String message = "震惊！哈尔滨上空惊现黑龙，吞云吐雾喜迎八方来客！";
        //发送 路由key 为 red 的消息；
        rabbitTemplate.convertAndSend(exchangeName, "red", message);

        //发送 路由key 为blue的消息；
        message = "最新消息！哈尔滨上空的黑龙实为纸鸢，已送给来尔滨的公主及殿下。";
        rabbitTemplate.convertAndSend(exchangeName, "blue", message);
    }

```

测试查看消费者控制台：

![image-20240118152435449](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240118152435449.png)

由于 `hmall.redirect` 交换机绑定的两个队列的路由key有`red`；所以指定了路由key为`red`的消息能被两个消费者都收到。

而路由key为 `blue` 的队列只有`direct.queue1`；所以只有监听这个队列的 消费者1 能够接收到消息：

### 3.6.4、总结

描述下Direct交换机与Fanout交换机的差异？

- Fanout交换机将消息路由给每一个与之绑定的队列
- Direct交换机根据RoutingKey判断路由给哪个队列
- 如果多个队列具有相同的RoutingKey，则与Fanout功能类似

## 3.7、Topic交换机

### 3.7.1、Topic类型交换机

`Topic`类型的`Exchange`与`Direct`相比，都是可以根据`RoutingKey`把消息路由到不同的队列。

只不过`Topic`类型`Exchange`可以让队列在绑定`RoutingKey` 的时候使用通配符！

`RoutingKey` 一般都是有一个或多个单词组成，多个单词之间以`.`分割，例如： `item.insert`

通配符规则：

- `#`：匹配一个或多个词
- `*`：匹配不多不少恰好1个词

举例：

- `item.#`：能够匹配`item.spu.insert` 或者 `item.spu`
- `item.*`：只能匹配`item.spu`

图示：

![image-20240118152938329](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240118152938329.png)

假如此时publisher发送的消息使用的`RoutingKey`共有四种：

- `china.news `代表有中国的新闻消息；
- `china.weather` 代表中国的天气消息；
- `japan.news` 则代表日本新闻
- `japan.weather` 代表日本的天气消息；

解释：

- `topic.queue1`：绑定的是`china.#` ，凡是以 `china.`开头的`routing key` 都会被匹配到，包括：
  - `china.news`
  - `china.weather`
- `topic.queue2`：绑定的是`#.news` ，凡是以 `.news`结尾的 `routing key` 都会被匹配。包括:
  - `china.news`
  - `japan.news`

接下来，我们就按照上图所示，来演示一下Topic交换机的用法。

首先，在控制台按照图示例子创建队列、交换机，并利用通配符绑定队列和交换机。此处步骤略。最终结果如下：

![image-20240118153753819](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240118153753819.png)

![image-20240118153827684](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240118153827684.png)

![image-20240118153941971](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240118153941971.png)

### 3.7.2、消息发送

在publisher服务的SpringAmqpTest类中添加测试方法：

```java
/*
    测试 topic exchange；
    向 hmall.topic 交换机发送消息，路由key为china.news 的消息
     */
    @Test
    public void testTopicExchange() {
        String exchangeName = "hmall.topic";
        String message = "中国冰城哈尔滨在这个冬天旅游火爆！";
        //发送 路由key 为 china.news 的消息；
        rabbitTemplate.convertAndSend(exchangeName, "china.news", message);
    }
```

### 3.7.3、消息接收

在consumer服务的SpringRabbitListener中添加方法：

```java
    /*
    监听 topic.queue1 队列的消息
     */
    @RabbitListener(queues = "topic.queue1")
    public void listenTopicQueue1(String message) {
        System.out.println("【消费者1】接收到消息: " + message );
    }
    /*
    监听 topic.queue2 队列的消息
     */
    @RabbitListener(queues = "topic.queue2")
    public void listenTopicQueue2(String message) {
        System.out.println("【消费者2】接收到消息: " + message );
    }
```

### 3.7.4、总结

描述下Direct交换机与Topic交换机的差异？

- Topic交换机接收的消息RoutingKey必须是多个单词，以 **`.`** 分割
- Topic交换机与队列绑定时的RoutingKey可以指定通配符
- `#`：代表0个或多个词
- `*`：代表1个词

## 3.8、代码声明队列和交换机

在之前我们都是基于RabbitMQ控制台来创建队列、交换机。但是在实际开发时，队列和交换机是程序员定义的，将来项目上线，又要交给运维去创建。那么程序员就需要把程序中运行的所有队列和交换机都写下来，交给运维。在这个过程中是很容易出现错误的。

因此推荐的做法是由程序启动时检查队列和交换机是否存在，如果不存在自动创建。

### 3.8.1、基本API

SpringAMQP提供了一个Queue类，用来创建队列：

![image-20240118163104335](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240118163104335.png)

SpringAMQP还提供了一个Exchange接口，来表示所有不同类型的交换机：

![image-20240118163153112](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240118163153112.png)

我们可以自己创建队列和交换机，不过SpringAMQP还提供了ExchangeBuilder来简化这个过程：

![image-20240118163255733](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240118163255733.png)

而在绑定队列和交换机时，则需要使用BindingBuilder来创建Binding对象：

![image-20240118163351608](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240118163351608.png)

### 3.8.2、fanout示例

在consumer中创建一个配置类 `com.itheima.consumer.config.FanoutConfig`，声明队列和交换机：

```java
package com.itheima.consumer.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.FanoutExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FanoutConfig {
    /*
    声明fanout类型交换机
     */
    @Bean
    public FanoutExchange fanoutExchange() {
        return new FanoutExchange("hmall.fanout");
    }

    /*
    声明队列，名称为 fanout.queue1
     */
    @Bean
    public Queue fanoutQueue1() {
        return new Queue("fanout.queue1");
    }
    /*
    绑定队列和交换机
     */
    @Bean
    public Binding fanoutBinding1(Queue fanoutQueue1, FanoutExchange fanoutExchange) {
        return BindingBuilder.bind(fanoutQueue1).to(fanoutExchange);
    }

    /*
    声明队列，名称为 fanout.queue2
     */
    @Bean
    public Queue fanoutQueue2() {
        return new Queue("fanout.queue2");
    }
    /*
    绑定队列和交换机
     */
    @Bean
    public Binding fanoutBinding2(Queue fanoutQueue2, FanoutExchange fanoutExchange) {
        return BindingBuilder.bind(fanoutQueue2).to(fanoutExchange);
    }
}

```

测试；先在rabbitMQ的控制台中将 hmall.fanout 及对应的两个队列删除；之后再运行 `com.itheima.consumer.ConsumerApplication` 然后到控制台中查看是否自动创建了对应交换机、队列以及相互绑定。

### 3.8.3、direct示例

在consumer中创建一个配置类 `com.itheima.consumer.config.DirectConfig`，声明队列和交换机。

direct模式由于要绑定多个KEY，会非常麻烦，每一个Key都要编写一个binding：

```java
package com.itheima.consumer.config;

import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DirectConfig {
    /*
    声明direct类型交换机
    */
    @Bean
    public DirectExchange directExchange(){
        return new DirectExchange("hmall.direct");
    }

    /*
    声明队列，名称为 direct.queue1
     */
    @Bean
    public Queue directQueue1() {
        return new Queue("direct.queue1");
    }

    /*
    绑定队列和交换机；路由key 为 red
     */
    @Bean
    public Binding directBinding1(Queue directQueue1, DirectExchange directExchange) {
        return BindingBuilder.bind(directQueue1).to(directExchange).with("red");
    }

    /*
    绑定队列和交换机；路由key 为 blue
     */
    @Bean
    public Binding directBinding2(Queue directQueue1, DirectExchange directExchange) {
        return BindingBuilder.bind(directQueue1).to(directExchange).with("blue");
    }

    /*
    声明队列，名称为 direct.queue2
     */
    @Bean
    public Queue directQueue2() {
        return new Queue("direct.queue2");
    }

    /*
    绑定队列和交换机；路由key 为 red
     */
    @Bean
    public Binding directBinding3(Queue directQueue2, DirectExchange directExchange) {
        return BindingBuilder.bind(directQueue2).to(directExchange).with("red");
    }

    /*
    绑定队列和交换机；路由key 为 yellow
     */
    @Bean
    public Binding directBinding4(Queue directQueue2, DirectExchange directExchange) {
        return BindingBuilder.bind(directQueue2).to(directExchange).with("yellow");
    }
}

```

测试；先在rabbitMQ的控制台中将 hmall.direct 及对应的两个队列删除；之后再运行 `com.itheima.consumer.ConsumerApplication` 然后到控制台中查看是否自动创建了对应交换机、队列以及相互绑定。

### 3.8.4、基于注解声明

基于@Bean的方式声明队列和交换机比较麻烦，Spring还提供了基于注解方式来声明。不过是在消息监听的时候基于注解的方式来声明。

例如，我们同样声明Direct模式的交换机和队列；改在 `com.itheima.consumer.listener.SpringRabbitListener`对应的 `listenDirectQueue1` 和 `listenDirectQueue2`两个方法；代码如下：

```java
	    /*
    监听 direct.queue1 队列的消息
     */
	@RabbitListener(bindings = @QueueBinding(
                value = @Queue("direct.queue1"),
                exchange = @Exchange(value = "hmall.direct", type = ExchangeTypes.DIRECT),
                key = {"red", "blue"}
    ))
    public void listenDirectQueue1(String message) {
        System.out.println("【消费者1】接收到消息: " + message );
    }
    /*
    监听 direct.queue2 队列的消息
     */
    @RabbitListener(bindings = @QueueBinding(
            value = @Queue("direct.queue2"),
            exchange = @Exchange(value = "hmall.direct", type = ExchangeTypes.DIRECT),
            key = {"red", "yellow"}
    ))
    public void listenDirectQueue2(String message) {
        System.out.println("【消费者2】接收到消息: " + message );
    }
```

测试；先在rabbitMQ的控制台中将 hmall.direct 及对应的两个队列删除；之后再注意 `DirectConfig`类的配置注解要注释掉。再运行 `com.itheima.consumer.ConsumerApplication` 然后到控制台中查看是否自动创建了对应交换机、队列以及相互绑定。

再试试Topic模式：

```java
	/*
    监听 topic.queue1 队列的消息
     */
    @RabbitListener(bindings = @QueueBinding(
                value = @Queue("topic.queue1"),
                exchange = @Exchange(value = "hmall.topic", type = ExchangeTypes.TOPIC),
                key = {"china.#"}
    ))
    public void listenTopicQueue1(String message) {
        System.out.println("【消费者1】接收到消息: " + message );
    }

    /*
    监听 topic.queue2 队列的消息
     */
    @RabbitListener(bindings = @QueueBinding(
            value = @Queue("topic.queue2"),
            exchange = @Exchange(value = "hmall.topic", type = ExchangeTypes.TOPIC),
            key = {"#.news"}
    ))
    public void listenTopicQueue2(String message) {
        System.out.println("【消费者2】接收到消息: " + message );
    }
```

测试；先在rabbitMQ的控制台中将 hmall.topic及对应的两个队列删除；再运行 `com.itheima.consumer.ConsumerApplication` 然后到控制台中查看是否自动创建了对应交换机、队列以及相互绑定。

## 3.9、消息转换器

Spring的消息发送代码接收的消息体是一个Object：

![image-20240118172141192](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240118172141192.png)

而在数据传输时，它会把你发送的消息序列化为字节发送给MQ，接收消息的时候，还会把字节反序列化为Java对象。

只不过，默认情况下Spring采用的序列化方式是JDK序列化。众所周知，JDK序列化存在下列问题：

- 数据体积过大
- 有安全漏洞
- 可读性差

我们来测试一下。

### 3.9.1、测试默认转换器

#### 1）创建测试队列

我们在consumer服务中声明一个新的配置类 `com.itheima.consumer.config.MessageConfig`；创建代码如下：

```java
package com.itheima.consumer.config;

import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MessageConfig {

    @Bean
    public Queue objectQueue() {
        return new Queue("object.queue");
    }
}

```

#### 2）发送Map消息

在 `com.itheima.publisher.amqp.SpringAmqpTest` 添加如下测试发送map结构的消息。

```java
    /*
    发送map类型消息到 object.queue
     */
    @Test
    public void testMap() {
        String queueName = "object.queue";
        //发送的消息
        Map<String, Object> map = new HashMap<>();
        map.put("name", "黑马");
        map.put("age", 20);
        //发送消息
        rabbitTemplate.convertAndSend(queueName, map);
    }

```

#### 3）查看消息

发送消息后查看RabbitMQ控制台：

![image-20240118180150659](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240118180150659.png)

可以看到消息格式非常不友好。

### 3.9.2、配置JSON转换器

#### 1）添加依赖

显然，JDK序列化方式并不合适。我们希望消息体的体积更小、可读性更高，因此可以使用JSON方式来做序列化和反序列化。

在`publisher`和`consumer`两个服务中都引入依赖；（在 mq-demo 工程中直接添加到父工程就行；传递依赖）；修改 `mq-demo\pom.xml` 添加如下依赖：

```xml
		<dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
        </dependency>
```

> **注意**：如果项目中引入了`spring-boot-starter-web`依赖，则无需再次引入`Jackson`依赖。

#### 2）配置消息转换器

配置消息转换器，在`publisher`和`consumer`两个服务的启动类中添加一个Bean即可。

修改 `com.itheima.publisher.PublisherApplication` 内容如下：

```java
package com.itheima.publisher;

import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class PublisherApplication {
    public static void main(String[] args) {
        SpringApplication.run(PublisherApplication.class);
    }

    @Bean
    public MessageConverter messageConverter() {
        //1、定义消息转换器
        Jackson2JsonMessageConverter jackson2JsonMessageConverter = new Jackson2JsonMessageConverter();
        //2、配置每条消息自动创建id；用于识别不同消息，也可以在页面中基于id判断是否是重复消息
        jackson2JsonMessageConverter.setCreateMessageIds(true);
        return jackson2JsonMessageConverter;
    }

}

```

修改 `com.itheima.consumer.ConsumerApplication` 内容如下：

```java
package com.itheima.consumer;

import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class ConsumerApplication {
    public static void main(String[] args) {
        SpringApplication.run(ConsumerApplication.class, args);
    }

    @Bean
    public MessageConverter messageConverter() {
        //1、定义消息转换器
        Jackson2JsonMessageConverter jackson2JsonMessageConverter = new Jackson2JsonMessageConverter();
        //2、配置每条消息自动创建id；用于识别不同消息，也可以在页面中基于id判断是否是重复消息
        jackson2JsonMessageConverter.setCreateMessageIds(true);
        return jackson2JsonMessageConverter;
    }
}

```

#### 3）测试

① 在rabbitMQ的控制台中删除 `object.queue` 队列中的消息；重新启动 consumer

② 执行 `com.itheima.publisher.amqp.SpringAmqpTest.testMap` 发送消息

③ 在rabbitMQ的控制台中；查看消息

![image-20240118184036512](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240118184036512.png)

### 3.9.3、消费者接收Object

我们在consumer服务中定义一个新的消费者，publisher是用Map发送，那么消费者也一定要用Map接收。

在 `com.itheima.consumer.listener.SpringRabbitListener` 添加如下方法接收map格式消息：

```java
 /*
    监听 object.queue 队列的消息
     */
    @RabbitListener(queues = "object.queue")
    public void listenObjectQueue(Map<String, Object> map) {
        System.out.println("【消费者】接收到 object.queue 的消息: " + map );
    }
```

# 4、业务改造

案例需求：改造余额支付功能，将支付成功后基于OpenFeign的交易服务的更新订单状态接口的同步调用，改为基于RabbitMQ的异步通知。

如图：

![image-20240118193814921](/assets/images/Java/微服务框架/RabbitMQ-基础/image-20240118193814921.png)

说明，我们只关注交易服务，步骤如下：

- 定义topic类型交换机，命名为`pay.topic`
- 定义消息队列，命名为`mark.order.pay.queue`
- 将`mark.order.pay.queue`与`pay.topic`绑定，`BindingKey`为`pay.success`
- 支付成功时不再调用交易服务更新订单状态的接口，而是发送一条消息到`pay.topic`，发送消息的`RoutingKey` 为`pay.success`，消息内容是订单id
- 交易服务监听`mark.order.pay.queue`队列，接收到消息后更新订单状态为已支付

## 4.1、配置MQ

### 4.1.1、添加依赖

修改 `hmall\pay-service\pom.xml` 以及 `hmall\trade-service\pom.xml`；添加如下依赖：

```xml
		<!-- spring amqp -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-amqp</artifactId>
        </dependency>
```

### 4.1.2、配置MQ地址

修改 `hmall\pay-service\src\main\resources\application.yaml`

以及 `hmall\trade-service\src\main\resources\application.yaml`；添加rabbitMQ的配置信息如下：

```yml
spring:
  rabbitmq:
    host: 192.168.12.168 # 你的虚拟机IP
    port: 5672 # 端口
    virtual-host: /hmall # 虚拟主机
    username: hmall # 用户名
    password: 123 # 密码
```

### 4.1.3、抽取消息转换器

编写 `hmall\hm-common\src\main\java\com\hmall\common\config\MqConfig.java` 类；内容如下：

```java
package com.hmall.common.config;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnClass(RabbitTemplate.class)
public class MqConfig {

    @Bean
    public MessageConverter messageConverter() {
        //1、定义消息转换器
        Jackson2JsonMessageConverter jackson2JsonMessageConverter = new Jackson2JsonMessageConverter();
        //2、配置每条消息自动创建id；用于识别不同消息，也可以在页面中基于id判断是否是重复消息
        jackson2JsonMessageConverter.setCreateMessageIds(true);
        return jackson2JsonMessageConverter;
    }
}

```

修改 `hmall\hm-common\src\main\resources\META-INF\spring.factories` 内容如下：

```
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
  com.hmall.common.config.MyBatisConfig,\
  com.hmall.common.config.JsonConfig,\
  com.hmall.common.config.MqConfig,\
  com.hmall.common.config.MvcConfig
```

## 4.2、发送消息

修改 `pay-service` 服务下的 `com.hmall.pay.service.impl.PayOrderServiceImpl`类中的 `tryPayOrderByBalance` 方法：

```java
    private final RabbitTemplate rabbitTemplate;
    @Override
    @GlobalTransactional
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
        //tradeClient.markOrderPaySuccess(po.getBizOrderNo());
        try {
            rabbitTemplate.convertAndSend("pay.topic", "pay.success", po.getBizOrderNo());
        } catch (AmqpException e) {
            System.out.println("支付成功的消息发送失败；支付单id：" + po.getId() + " ；交易单号：" + po.getBizOrderNo());
            e.printStackTrace();
        }
        //故意制造错误；然后查看用户的余额是否回滚
        //int i = 1/0;
    }

```

## 4.3、接收消息

在 trade-service 微服务中编写消息监听器类 `hmall\trade-service\src\main\java\com\hmall\trade\listener\PayStatusListener.java`：

```java
package com.hmall.trade.listener;

import com.hmall.trade.service.IOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.core.ExchangeTypes;
import org.springframework.amqp.rabbit.annotation.Exchange;
import org.springframework.amqp.rabbit.annotation.Queue;
import org.springframework.amqp.rabbit.annotation.QueueBinding;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PayStatusListener {

    private final IOrderService orderService;

    /*
    监听订单支付成功消息
     */
    @RabbitListener(bindings = @QueueBinding(
                value = @Queue(value = "mark.order.pay.queue", durable = "true"),
                exchange = @Exchange(value = "pay.topic", type = ExchangeTypes.TOPIC, durable = "true"),
                key = {"pay.success"}
    ))
    public void listenePaySuccessMsg(Long orderId) {
        orderService.markOrderPaySuccess(orderId);
    }
}

```

## 4.4、测试

启动黑马商城所有微服务；以及前端。 购买一个商品直到支付完成。

查看 `hm-trade` 数据库中 `order` 表中对应的订单的 `status` 的值是否修改为 2。若为2说明支付状态是同步成功的。

# 5、练习

## 5.1、抽取共享的MQ配置

### 5.1.1、需求描述

将MQ配置抽取到Nacos中管理，微服务中直接使用共享配置。

### 5.1.2、实现

#### 1）创建共享配置文件

在nacos中创建 `shared-mq.yaml` 内容如下：

```yml
spring:
  rabbitmq:
    host: ${hm.mq.host:192.168.12.168} # 你的虚拟机IP
    port: ${hm.mq.port:5672} # 端口
    virtual-host: ${hm.mq.vhost:/hmall} # 虚拟主机
    username: ${hm.mq.username:hmall} # 用户名
    password: ${hm.mq.password:123} # 密码
    listener:
      simple:
        prefetch: 1 # 每次只能获取一条消息，处理完成才能获取下一个消息
```

#### 2）改造微服务配置文件

① 修改 trade-service的配置

删除 `hmall\trade-service\src\main\resources\application.yaml` 与mq相关的配置。

修改 `hmall\trade-service\src\main\resources\bootstrap.yml` 内容如下：

```yml
spring:
  application:
    name: trade-service # 服务名称
  profiles:
    active: dev
  cloud:
    nacos:
      server-addr: 192.168.12.168 # nacos地址
      config:
        file-extension: yaml # 文件后缀名
        shared-configs: # 共享配置
          - dataId: shared-jdbc.yaml # 共享mybatis配置
          - dataId: shared-log.yaml # 共享日志配置
          - dataId: shared-swagger.yaml # 共享日志配置
          - dataId: shared-seata.yaml # 共享seata配置
          - dataId: shared-mq.yaml # 共享mq配置
```

② 修改 pay-service的配置

删除 `hmall\pay-service\src\main\resources\application.yaml` 与mq相关的配置。

修改 `hmall\pay-service\src\main\resources\bootstrap.yml` 内容如下：

```yml
spring:
  application:
    name: pay-service # 服务名称
  profiles:
    active: dev
  cloud:
    nacos:
      server-addr: 192.168.12.168 # nacos地址
      config:
        file-extension: yaml # 文件后缀名
        shared-configs: # 共享配置
          - dataId: shared-jdbc.yaml # 共享mybatis配置
          - dataId: shared-log.yaml # 共享日志配置
          - dataId: shared-swagger.yaml # 共享日志配置
          - dataId: shared-seata.yaml # 共享seata配置
          - dataId: shared-mq.yaml # 共享mq配置
```

#### 3）测试

启动后端微服务和nginx；测试下单支付；查看是能下单、删除购物车商品及修改订单状态。

## 5.2、改造下单功能

### 5.2.1、需求描述

改造下单功能，将基于OpenFeign的清理购物车同步调用，改为基于RabbitMQ的异步通知：

- 定义topic类型交换机，命名为`trade.topic`
- 定义消息队列，命名为`cart.clear.queue`
- 将`cart.clear.queue`与`trade.topic`绑定，`RoutingKey`为`order.create`
- 下单成功时不再调用清理购物车接口，而是发送一条消息到`trade.topic`，发送消息的`RoutingKey` 为`order.create`，消息内容是下单的具体商品、当前登录用户信息
- 购物车服务监听`cart.clear.queue`队列，接收到消息后清理指定用户的购物车中的指定商品

### 5.2.2、实现

#### 1）定义常量

编写 `hmall\hm-common\src\main\java\com\hmall\common\constants\MqConstants.java` 内容如下：

```java
package com.hmall.common.constants;

public class MqConstants {

    public static final String TRADE_EXCHANGE_NAME = "trade.topic";
    public static final String ROUTING_KEY_ORDER_CREATE = "order.create";

}

```

#### 2）发送消息

修改 `hmall\trade-service\src\main\java\com\hmall\trade\service\impl\OrderServiceImpl.java` 的 `createOrder` 方法内容如下：

```java
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
        //cartClient.deleteCartItemByIds(itemIds);
        rabbitTemplate.convertAndSend(MqConstants.TRADE_EXCHANGE_NAME, MqConstants.ROUTING_KEY_ORDER_CREATE, itemIds
                , new MessagePostProcessor() {
            @Override
            public Message postProcessMessage(Message message) throws AmqpException {
                //通过消息头传递当前操作的用户
                message.getMessageProperties().setHeader("user-info", UserContext.getUser());
                return message;
            }
        });
```

#### 3）编写消息监听器

编写 `hmall\cart-service\src\main\java\com\hmall\cart\listener\OrderStatusListener.java` 消息监听器内容如下：

```java
package com.hmall.cart.listener;

import com.hmall.cart.service.ICartService;
import com.hmall.common.constants.MqConstants;
import com.hmall.common.utils.UserContext;
import lombok.RequiredArgsConstructor;
import org.apache.catalina.User;
import org.springframework.amqp.core.ExchangeTypes;
import org.springframework.amqp.rabbit.annotation.Exchange;
import org.springframework.amqp.rabbit.annotation.Queue;
import org.springframework.amqp.rabbit.annotation.QueueBinding;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class OrderStatusListener {

    private final ICartService cartService;

    @RabbitListener(bindings = @QueueBinding(
                value = @Queue(value = "cart.clear.queue", durable = "true"),
                exchange = @Exchange(value = MqConstants.TRADE_EXCHANGE_NAME, type = ExchangeTypes.TOPIC, durable = "true"),
                key = {MqConstants.ROUTING_KEY_ORDER_CREATE}
    ))
    public void listenOrderCreate(List<Long> itemIds, @Header("user-info")Long userId) {
        //获取当前用户id
        UserContext.setUser(userId);
        cartService.removeByItemIds(itemIds);

        //删除用户id
        UserContext.removeUser();
    }
}

```
