# RabbitMQ-高级

在昨天的练习作业中，我们改造了余额支付功能，在支付成功后利用RabbitMQ通知交易服务，更新业务订单状态为已支付。

但是大家思考一下，如果这里MQ通知失败，支付服务中支付流水显示支付成功，而交易服务中的订单状态却显示未支付，数据出现了不一致。

此时前端发送请求查询支付状态时，肯定是查询交易服务状态，会发现业务订单未支付，而用户自己知道已经支付成功，这就导致用户体验不一致。

因此，这里我们必须尽可能确保MQ消息的可靠性，即：消息应该至少被消费者处理1次

那么问题来了：

- **我们该如何确保MQ消息的可靠性**？
- **如果真的发送失败，有没有其它的兜底方案？**

这些问题，在今天的学习中都会找到答案。

# 1、生产者的可靠性

首先，我们一起分析一下消息丢失的可能性有哪些。

消息从发送者发送消息，到消费者处理消息，需要经过的流程是这样的：

![image-20240120105417898](/assets/images/Java/微服务框架/RabbitMQ-高级/image-20240120105417898.png)

消息从生产者到消费者的每一步都可能导致消息丢失：

- 发送消息时丢失：
  - 生产者发送消息时连接MQ失败
  - 生产者发送消息到达MQ后未找到`Exchange`
  - 生产者发送消息到达MQ的`Exchange`后，未找到合适的`Queue`
  - 消息到达MQ后，处理消息的进程发生异常
- MQ导致消息丢失：
  - 消息到达MQ，保存到队列后，尚未消费就突然宕机
- 消费者处理消息时：
  - 消息接收后尚未处理突然宕机
  - 消息接收后处理过程中抛出异常

综上，我们要解决消息丢失问题，保证MQ的可靠性，就必须从3个方面入手：

- 确保生产者一定把消息发送到MQ
- 确保MQ不会将消息弄丢
- 确保消费者一定要处理消息

这一章我们先来看如何确保生产者一定能把消息发送到MQ。

## 1.1、生产者重试机制

首先第一种情况，就是生产者发送消息时，出现了网络故障，导致与MQ的连接中断。

为了解决这个问题，SpringAMQP提供的消息发送时的重试机制。即：当`RabbitTemplate`与MQ连接超时后，多次重试。

修改 `mq-demo\consumer\src\main\resources\application.yml`文件，新增内容如下：

```yml
spring:
  rabbitmq:
    connection-timeout: 1s # 设置MQ的连接超时时间
    template:
      retry:
        enabled: true # 开启超时重试机制
        initial-interval: 1000ms # 失败后的初始等待时间
        multiplier: 1 # 失败后下次的等待时长倍数，下次等待时长 = 失败后的初始等待时间（initial-interval） * multiplier
        max-attempts: 3 # 最大重试次数
```

我们利用命令停掉RabbitMQ服务：

```Shell
docker stop mq
```

然后执行 `com.itheima.publisher.amqp.SpringAmqpTest.testSimpleQueue()` 测试发送一条消息，会发现会每隔1秒（连接超时1秒，隔1秒；所以输出的时候显示每隔2秒）重试1次，总共重试了3次。消息发送的超时重试机制配置成功了！

![image-20240120113141175](/assets/images/Java/微服务框架/RabbitMQ-高级/image-20240120113141175.png)

**注意**：当网络不稳定的时候，利用重试机制可以有效提高消息发送的成功率。不过SpringAMQP提供的重试机制是**阻塞式**的重试，也就是说多次重试等待的过程中，当前线程是被阻塞的。

如果对于业务性能有要求，建议禁用重试机制。如果一定要使用，请合理配置等待时长和重试次数，当然也可以考虑使用异步线程来执行发送消息的代码。

## 1.2、生产者确认机制

一般情况下，只要生产者与MQ之间的网路连接顺畅，基本不会出现发送消息丢失的情况，因此大多数情况下我们无需考虑这种问题。

不过，在少数情况下，也会出现消息发送到MQ之后丢失的现象，比如：

- MQ内部处理消息的进程发生了异常
- 生产者发送消息到达MQ后未找到`Exchange`
- 生产者发送消息到达MQ的`Exchange`后，未找到合适的`Queue`，因此无法路由

针对上述情况，RabbitMQ提供了生产者消息确认机制，包括`Publisher Confirm`和`Publisher Return`两种。在开启确认机制的情况下，当生产者发送消息给MQ后，MQ会根据消息处理的情况返回不同的**回执**。

具体如图所示：

![image-20240120113507460](/assets/images/Java/微服务框架/RabbitMQ-高级/image-20240120113507460.png)

总结如下：

- 当消息投递到MQ，但是路由失败时，通过**Publisher Return**返回异常信息，同时返回ack的确认信息，代表投递成功
- 临时消息投递到了MQ，并且入队成功，返回ACK，告知投递成功
- 持久消息投递到了MQ，并且入队完成持久化，返回ACK ，告知投递成功
- 其它情况都会返回NACK，告知投递失败

其中`ack`和`nack`属于**Publisher Confirm**机制，`ack`是投递成功；`nack`是投递失败。而`return`则属于**Publisher Return**机制。

默认两种机制都是关闭状态，需要通过配置文件来开启。

## 1.3、实现生产者确认

### 1.3.1、开启生产者确认

在publisher模块的`application.yaml`中添加配置：

```YAML
spring:
  rabbitmq:
    publisher-confirm-type: correlated # 开启publisher confirm机制，并设置confirm类型
    publisher-returns: true # 开启publisher return机制
```

这里`publisher-confirm-type`有三种模式可选：

- `none`：关闭confirm
- `simple`：同步阻塞等待MQ的回执
- `correlated`：MQ异步回调返回回执

一般我们推荐使用`correlated`，回调机制。

### 1.3.2、定义ReturnCallback

每个`RabbitTemplate`只能配置一个`ReturnCallback`，因此我们可以在配置类中统一设置。我们在publisher模块定义一个配置类

`mq-demo\publisher\src\main\java\com\itheima\publisher\config\MqConfig.java` 代码如下：

```java
package com.itheima.publisher.config;

import lombok.RequiredArgsConstructor;
import org.springframework.amqp.core.ReturnedMessage;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.context.annotation.Configuration;

import javax.annotation.PostConstruct;

@Slf4j
@Configuration
@RequiredArgsConstructor
public class MqConfig {

    private final RabbitTemplate rabbitTemplate;

    @PostConstruct
    public void init() {
        rabbitTemplate.setReturnsCallback(new RabbitTemplate.ReturnsCallback() {
            @Override
            public void returnedMessage(ReturnedMessage returned) {
                log.debug("触发return callback!");
                System.out.println("exchange = " + returned.getExchange());
                System.out.println("routingKey = " + returned.getRoutingKey());
                System.out.println("message = " + returned.getMessage());
                System.out.println("replyCode = " + returned.getReplyCode());
                System.out.println("replyText = " + returned.getReplyText());
            }
        });
    }
}
```

### 1.3.3、定义ConfirmCallback

由于每个消息发送时的处理逻辑不一定相同，因此ConfirmCallback需要在每次发消息时定义。具体来说，是在调用RabbitTemplate中的convertAndSend方法时，多传递一个参数：

![image-20240120143618089](/assets/images/Java/微服务框架/RabbitMQ-高级/image-20240120143618089.png)

这里的CorrelationData中包含两个核心的东西：

- `id`：消息的唯一标示，MQ对不同的消息的回执以此做判断，避免混淆
- `SettableListenableFuture`：回执结果的Future对象

将来MQ的回执就会通过这个`Future`来返回，我们可以提前给`CorrelationData`中的`Future`添加回调函数来处理消息回执：

![image-20240120143912038](/assets/images/Java/微服务框架/RabbitMQ-高级/image-20240120143912038.png)

我们新增一个测试方法，向交换机发送消息并且routing key是不存在的来进行测试，并且添加`ConfirmCallback`：

修改 `com.itheima.publisher.amqp.SpringAmqpTest` 新增 `testConfirmCallback` 方法；内容如下：

```java
    /*
    测试 comfirmCallback 模式；
     */
    @Test
    public void testConfirmCallback() throws InterruptedException {
        //1、创建CorrelationData
        CorrelationData correlationData = new CorrelationData();
        //2、设置CorrelationData的Future
        correlationData.getFuture().addCallback(new ListenableFutureCallback<CorrelationData.Confirm>() {
            @Override
            public void onFailure(Throwable ex) {
                // 只有当Future发生异常时，才会回调onFailure方法；基本不会发生
                System.out.println("发送消息失败！onFailure: " + ex.getMessage());
            }

            @Override
            public void onSuccess(CorrelationData.Confirm result) {
                // 当Future无异常成功时，才会回调onSuccess方法；接收到回执的处理逻辑；result是回执内容
                if (result.isAck()) {
                    System.out.println("发送消息成功！onSuccess: 接收到回执ack");
                } else {
                    System.out.println("发送消息失败！onSuccess: 接收到回执nack；reason：" + result.getReason());
                }
            }
        });
        //3、发送消息并设置ConfirmCallback；发送的交换机，但是路由key是不存在的
        rabbitTemplate.convertAndSend("hmall.direct", "xxx", "hello", correlationData);

        //线程休眠3秒，等消息发送成功并接受到回执等信息
        Thread.sleep(3000);
    }

```

> **注意**：测试的时候要启动MQ

执行结果如下：

![image-20240120145856039](/assets/images/Java/微服务框架/RabbitMQ-高级/image-20240120145856039.png)

可以看到，由于传递的`RoutingKey`是错误的，路由失败后，触发了`return callback`，同时也收到了ack。

当我们修改为正确的`RoutingKey`以后，就不会触发`return callback`了，只收到ack。

而如果连交换机都是错误的，则只会收到nack。

> **Tips**：
>
> 开启生产者确认比较消耗MQ性能，一般不建议开启。而且大家思考一下触发确认的几种情况：
>
> - 路由失败：一般是因为RoutingKey错误导致，往往是编程导致
> - 交换机名称错误：同样是编程错误导致
> - MQ内部故障：这种需要处理，但概率往往较低。因此只有对消息可靠性要求非常高的业务才需要开启，而且仅仅需要开启ConfirmCallback处理nack就可以了。

# 2、MQ的可靠性

消息到达MQ以后，如果MQ不能及时保存，也会导致消息丢失，所以MQ的可靠性也非常重要。

## 2.1、数据持久化

为了提升性能，默认情况下MQ的数据都是在内存存储的临时数据，重启后就会消失。为了保证数据的可靠性，必须配置数据持久化，包括：

- 交换机持久化
- 队列持久化
- 消息持久化

我们以控制台界面为例来说明。

### 2.1.1、交换机持久化

在控制台的`Exchanges`页面，添加交换机时可以配置交换机的`Durability`参数：

![image-20240120150854277](/assets/images/Java/微服务框架/RabbitMQ-高级/image-20240120150854277.png)

设置为`Durable`就是持久化模式，`Transient`就是临时模式。

测试： 可以创建一个名 test 的交换机；然后设置为 `Transient` ，再重启 mq 之后查看；它已经不存在，说明它是临时的，重启之后就不存在。

![image-20240120152224594](/assets/images/Java/微服务框架/RabbitMQ-高级/image-20240120152224594.png)

### 2.1.2、队列持久化

在控制台的Queues页面，添加队列时，同样可以配置队列的`Durability`参数：

![image-20240120151026786](/assets/images/Java/微服务框架/RabbitMQ-高级/image-20240120151026786.png)

除了持久化以外，你可以看到队列还有很多其它参数，有一些我们会在后期学习。

测试：可以创建一个名 test 的队列；然后设置为 `Transient` ，再重启 mq 之后查看；它已经不存在，说明它是临时的，重启之后就不存在。

![image-20240120152359305](/assets/images/Java/微服务框架/RabbitMQ-高级/image-20240120152359305.png)

重启之后；上面名字为 test 的队列将不存在。

### 2.1.3、消息持久化

在控制台发送消息的时候，可以添加很多参数，而消息的持久化是要配置一个`Delivery mode`：

![image-20240120151823596](/assets/images/Java/微服务框架/RabbitMQ-高级/image-20240120151823596.png)

测试：在 `simple.queue` 下发两条消息；一条是持久化的，一条是临时的消息；然后重启mq再查看队列中的消息。

![image-20240120152700062](/assets/images/Java/微服务框架/RabbitMQ-高级/image-20240120152700062.png)

![image-20240120152750857](/assets/images/Java/微服务框架/RabbitMQ-高级/image-20240120152750857.png)

![image-20240120153007905](/assets/images/Java/微服务框架/RabbitMQ-高级/image-20240120153007905.png)

![image-20240120153146187](/assets/images/Java/微服务框架/RabbitMQ-高级/image-20240120153146187.png)

> **说明**：
>
> 1、持久化的消息：是在没有消费的情况下存在MQ，消费了的话也被删除
>
> 2、在开启持久化机制以后，如果同时还开启了生产者确认，那么MQ会在消息持久化以后才发送ACK回执，进一步确保消息的可靠性。
>
> 不过出于性能考虑，为了减少IO次数，发送到MQ的消息并不是逐条持久化到硬盘的，而是每隔一段时间批量持久化。一般间隔在100毫秒左右，这就会导致ACK有一定的延迟，因此建议生产者确认全部采用异步方式。

## 2.2、LazyQueue

在默认情况下，RabbitMQ会将接收到的信息保存在内存中以降低消息收发的延迟。但在某些特殊情况下，这会导致消息积压，比如：

- 消费者宕机或出现网络故障
- 消息发送量激增，超过了消费者处理速度
- 消费者处理业务发生阻塞

一旦出现消息堆积问题，RabbitMQ的内存占用就会越来越高，直到触发内存预警上限。此时RabbitMQ会将内存消息刷到磁盘上，这个行为称为`PageOut`. `PageOut`会耗费一段时间，并且会阻塞队列进程。因此在这个过程中RabbitMQ不会再处理新的消息，生产者的所有请求都会被阻塞。

在 `com.itheima.publisher.amqp.SpringAmqpTest` 新增方法 `testPageOut()`来演示 PageOut ；往 `simple.queue`队列发送100w条临时消息；

为了测试看效果；修改 `mq-demo\publisher\src\main\resources\application.yml` 关闭消息确认机制，提高发送消息的效率：

```yml
spring:
  rabbitmq:
    publisher-confirm-type: none
    publisher-returns: false
```

测试代码如下：

```java
    /*
    演示 pageOut
     */
    @Test
    public void testPageOut() {
        // 往 simple.queue 队列中发送100w 条临时消息
        Message message = MessageBuilder.withBody("hello".getBytes(StandardCharsets.UTF_8))
                .setDeliveryMode(MessageDeliveryMode.NON_PERSISTENT)
                .build();
        for (int i = 0; i < 1000000; i++) {
            rabbitTemplate.convertAndSend("simple.queue", message);
        }
    }
```

访问控制查看 simple.queue 的队列情况：

![image-20240120160058777](/assets/images/Java/微服务框架/RabbitMQ-高级/image-20240120160058777.png)

在控制台中将队列消息清空；

![image-20240120160256981](/assets/images/Java/微服务框架/RabbitMQ-高级/image-20240120160256981.png)

再修改上述代码；发送持久化消息测试结果如下：

![image-20240120160151412](/assets/images/Java/微服务框架/RabbitMQ-高级/image-20240120160151412.png)

![image-20240120160643771](/assets/images/Java/微服务框架/RabbitMQ-高级/image-20240120160643771.png)

为了解决这个问题，从RabbitMQ的3.6.0版本开始，就增加了Lazy Queue的模式，也就是惰性队列。惰性队列的特征如下：

- 接收到消息后直接存入磁盘而非内存
- 消费者要消费消息时才会从磁盘中读取并加载到内存（也就是懒加载）
- 支持数百万条的消息存储

而在3.12版本之后，LazyQueue已经成为所有队列的默认格式。因此官方推荐升级MQ为3.12版本或者所有队列都设置为LazyQueue模式。

### 2.2.1、控制台配置lazy模式

在添加队列的时候，添加`x-queue-mod=lazy`参数即可设置队列为Lazy模式：

![image-20240120161408060](/assets/images/Java/微服务框架/RabbitMQ-高级/image-20240120161408060.png)

测试效果；再修改上述代码；发送非持久化消息到 `lazy.queue` 测试结果如下：

![image-20240120161733336](/assets/images/Java/微服务框架/RabbitMQ-高级/image-20240120161733336.png)

![image-20240120162048159](/assets/images/Java/微服务框架/RabbitMQ-高级/image-20240120162048159.png)

### 2.2.2、代码配置Lazy模式（了解）

下面的内容；只是展示如何使用代码方式设置队列为lazy；效果与控制配置一样，不再测试；所以也就不需要再写任何代码了。大家了解即可。

在利用SpringAMQP声明队列的时候，添加`x-queue-mod=lazy`参数也可设置队列为Lazy模式：

```java
@Bean
    public Queue lazyQueue(){
        return QueueBuilder.durable("lazy.queue")
                .lazy() // 消息队列是否是lazy模式；里面设置了一个参数x-queue-mode，表示是否是lazy模式
                .build();
    }
```

当然，我们也可以基于注解来声明队列并设置为Lazy模式：

```java
@RabbitListener(
            queuesToDeclare = @Queue(
                    name = "lazy.queue",
                    durable = "true",
                    arguments = @Argument(name = "x-queue-mode", value = "lazy")
            )

    )
    public void listenLazyQueue(String message) {
        System.out.println("lazyQueue: " + message);
    }
```

# 3、消费者的可靠性

当RabbitMQ向消费者投递消息以后，需要知道消费者的处理状态如何。因为消息投递给消费者并不代表就一定被正确消费了，可能出现的故障有很多，比如：

- 消息投递的过程中出现了网络故障
- 消费者接收到消息后突然宕机
- 消费者接收到消息后，因处理不当导致异常
- ...

一旦发生上述情况，消息也会丢失。因此，RabbitMQ必须知道消费者的处理状态，一旦消息处理失败才能重新投递消息。

但问题来了：RabbitMQ如何得知消费者的处理状态呢？

本章我们就一起研究一下消费者处理消息时的可靠性解决方案。

## 3.1、消费者确认机制

为了确认消费者是否成功处理消息，RabbitMQ提供了消费者确认机制（**Consumer Acknowledgement**）。即：当消费者处理消息结束后，应该向RabbitMQ发送一个回执，告知RabbitMQ自己消息处理状态。回执有三种可选值：

- ack：成功处理消息，RabbitMQ从队列中删除该消息
- nack：消息处理失败，RabbitMQ需要再次投递消息
- reject：消息处理失败并拒绝该消息，RabbitMQ从队列中删除该消息

一般reject方式用的较少，除非是消息格式有问题，那就是开发问题了。因此大多数情况下我们需要将消息处理的代码通过`try catch`机制捕获，消息处理成功时返回ack，处理失败时返回nack.

由于消息回执的处理代码比较统一，因此SpringAMQP帮我们实现了消息确认。并允许我们通过配置文件设置ACK处理方式，有三种模式：

- **`none`**：不处理。即消息投递给消费者后立刻ack，消息会立刻从MQ删除。非常不安全，不建议使用
- **`manual`**：手动模式。需要自己在业务代码中调用api，发送`ack`或`reject`，存在业务入侵，但更灵活
- **`auto`**：自动模式。SpringAMQP利用AOP对我们的消息处理逻辑做了环绕增强，当业务正常执行时则自动返回`ack`. 当业务出现异常时，根据异常判断返回不同结果：
  - 如果是**业务异常**，会自动返回`nack`；
  - 如果是**消息处理或校验异常**，自动返回`reject`;

返回Reject的常见异常有：

> Starting with version 1.3.2, the default ErrorHandler is now a ConditionalRejectingErrorHandler that rejects (and does not requeue) messages that fail with an irrecoverable error. Specifically, it rejects messages that fail with the following errors:
>
> - o.s.amqp…MessageConversionException: Can be thrown when converting the incoming message payload using a MessageConverter.
> - o.s.messaging…MessageConversionException: Can be thrown by the conversion service if additional conversion is required when mapping to a @RabbitListener method.
> - o.s.messaging…MethodArgumentNotValidException: Can be thrown if validation (for example, @Valid) is used in the listener and the validation fails.
> - o.s.messaging…MethodArgumentTypeMismatchException: Can be thrown if the inbound message was converted to a type that is not correct for the target method. For example, the parameter is declared as Message`<Foo>` but Message`<Bar>`is received.
> - java.lang.NoSuchMethodException: Added in version 1.6.3.
> - java.lang.ClassCastException: Added in version 1.6.3.

通过下面的配置可以修改SpringAMQP的ACK处理方式；需要注意的是在消费方的配置文件中新增如下配置：

在 `mq-demo\consumer\src\main\resources\application.yml` 添加如下配置

```YAML
spring:
  rabbitmq:
    listener:
      simple:
        acknowledge-mode: none # 不做处理
```

修改consumer服务的SpringRabbitListener类中的方法，模拟一个消息处理的异常：

```Java
    /*
    利用@RabbitListener注解，可以监听到对应队列的消息
    一旦监听的队列有消息，就会回调当前方法，在方法中接收消息并消费处理消息
     */
    @RabbitListener(queues = "simple.queue")
    public void listenSimpleQueueMessage(String message) throws Exception {
        System.out.println("SpringRabbitListener listenSimpleQueueMessage 消费者接收到消息: " + message);

        //故意抛出消息转换异常 - reject
        throw new MessageConversionException("故意抛出！消息转换异常");
    }
```

测试：在代码中往 `simple.queue`队列发送消息，执行 `com.itheima.publisher.amqp.SpringAmqpTest.testSimpleQueue`； 发送消息。

可以发现：当消息处理发生异常时，消息依然被RabbitMQ删除了。

我们再次把确认机制修改为auto：

```YAML
spring:
  rabbitmq:
    listener:
      simple:
        acknowledge-mode: auto # 自动ack
```

在异常位置打断点，再次发送消息，程序卡在断点时，可以发现此时消息状态为`unacked`（未确定状态）：

![image-20240120173251697](/assets/images/Java/微服务框架/RabbitMQ-高级/image-20240120173251697.png)

放行以后，由于抛出的是**消息转换异常**，因此Spring会自动返回`reject`，所以消息依然会被删除：

![image-20240120173323586](/assets/images/Java/微服务框架/RabbitMQ-高级/image-20240120173323586.png)

我们将异常改为RuntimeException类型：

```java
@RabbitListener(queues = "simple.queue")
    public void listenSimpleQueueMessage(String message) throws Exception {
        System.out.println("SpringRabbitListener listenSimpleQueueMessage 消费者接收到消息: " + message);

        //故意抛出消息转换异常 - reject
        //throw new MessageConversionException("故意抛出！消息转换异常");
        //故意抛出其它异常 - nack；业务异常，会重发
        throw new RuntimeException("故意抛出！其它异常");
    }
```

在异常位置打断点，然后再次发送消息测试，程序卡在断点时，可以发现此时消息状态为`unacked`（未确定状态）：

![image-20240120173610506](/assets/images/Java/微服务框架/RabbitMQ-高级/image-20240120173610506.png)

放行以后，由于抛出的是业务异常，所以Spring返回`nack`，最终消息恢复至`Ready`状态，并且没有被RabbitMQ删除；会一直投递，可以关闭consumer后再看控制台：

![image-20240120173707771](/assets/images/Java/微服务框架/RabbitMQ-高级/image-20240120173707771.png)

当我们把配置改为`auto`时，消息处理失败后，会回到RabbitMQ，并重新投递到消费者。

## 3.2、失败重试机制

当消费者出现异常后，消息会不断requeue（重入队）到队列，再重新发送给消费者。如果消费者再次执行依然出错，消息会再次requeue到队列，再次投递，直到消息处理成功为止。

极端情况就是消费者一直无法执行成功，那么消息requeue就会无限循环，导致mq的消息处理飙升，带来不必要的压力：

![image-20240120173926498](/assets/images/Java/微服务框架/RabbitMQ-高级/image-20240120173926498.png)

当然，上述极端情况发生的概率还是非常低的，不过不怕一万就怕万一。为了应对上述情况Spring又提供了消费者失败重试机制：在消费者出现异常时利用本地重试，而不是无限制的requeue到mq队列。

修改consumer服务的application.yml文件，添加内容：

```yml
spring:
  rabbitmq:
    listener:
      simple:
        retry:
          enabled: true
          max-attempts: 3 # 最大重试次数
          initial-interval: 1000 # 重试间隔时间
          multiplier: 1 # 重试间隔时间倍数；下次等待时长 = 上次重试间隔时间（initial-interval） * multiplier
          stateless: true # 是否为无状态的，即重试时会重新获取一次连接；如果包含事务则为 false
```

重启consumer服务，重复之前的测试。可以发现：

- 消费者在失败后消息没有重新回到MQ无限重新投递，而是在本地重试了3次
- 本地重试3次以后，抛出了`AmqpRejectAndDontRequeueException`异常。查看RabbitMQ控制台，发现消息被删除了，说明最后SpringAMQP返回的是`reject`

结论：

- 开启本地重试时，消息处理过程中抛出异常，不会requeue到队列，而是在消费者本地重试
- 重试达到最大次数后，Spring会返回reject，消息会被丢弃

## 3.3、失败处理策略

在之前的测试中，本地测试达到最大重试次数后，消息会被丢弃。这在某些对于消息可靠性要求较高的业务场景下，显然不太合适了。

因此Spring允许我们自定义重试次数耗尽后的消息处理策略，这个策略是由`MessageRecovery`接口来定义的，它有3个不同实现：

- `RejectAndDontRequeueRecoverer`：重试耗尽后，直接`reject`，丢弃消息。默认就是这种方式
- `ImmediateRequeueMessageRecoverer`：重试耗尽后，返回`nack`，消息重新入队
- `RepublishMessageRecoverer`：重试耗尽后，将失败消息投递到指定的交换机

比较优雅的一种处理方案是`RepublishMessageRecoverer`，失败后将消息投递到一个指定的，专门存放异常消息的队列，后续由人工集中处理。

采用第三种方式的话：在消费者方创建 `com.itheima.consumer.config.ErrorMessageConfig` 代码如下：

```java
package com.itheima.consumer.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.rabbit.retry.MessageRecoverer;
import org.springframework.amqp.rabbit.retry.RepublishMessageRecoverer;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnProperty(name = "spring.rabbitmq.listener.simple.retry.enabled", havingValue = "true")
public class ErrorMessageConfig {

    //定义名字为的error.direct的direct交换机
    @Bean
    public DirectExchange errorDirectExchange() {
        return new DirectExchange("error.direct");
    }
    //定义名字为error.queue的队列
    @Bean
    public Queue errorQueue() {
        return new Queue("error.queue", true);
    }
    //error.direct交换机和error.queue队列绑定
    @Bean
    public Binding errorBinding(Queue errorQueue, DirectExchange errorDirectExchange) {
        return BindingBuilder.bind(errorQueue).to(errorDirectExchange).with("error");
    }

    //设置RabbitTemplate在尝试接收最大次数之后投递的交换机和路由key
    @Bean
    public MessageRecoverer messageRecoverer(RabbitTemplate rabbitTemplate) {
        return new RepublishMessageRecoverer(rabbitTemplate, "error.direct", "error");
    }
}

```

测试：启动consumer；然后再次发送消息到 `simple.queue` 可以看到在 `error.queue`队列中有消息及异常信息。

## 3.4、业务幂等性

何为幂等性？

**幂等**是一个数学概念，用函数表达式来描述是这样的：`f(x) = f(f(x))`，例如求绝对值函数。

在程序开发中，则是指同一个业务，执行一次或多次对业务状态的影响是一致的。例如：

- 根据id删除数据
- 查询数据
- 新增数据

但数据的更新往往不是幂等的，如果重复执行可能造成不一样的后果。比如：

- 取消订单，恢复库存的业务。如果多次恢复就会出现库存重复增加的情况
- 退款业务。重复退款对商家而言会有经济损失。

所以，我们要尽可能避免业务被重复执行。

然而在实际业务场景中，由于意外经常会出现业务被重复执行的情况，例如：

- 页面卡顿时频繁刷新导致表单重复提交
- 服务间调用的重试
- MQ消息的重复投递

我们在用户支付成功后会发送MQ消息到交易服务，修改订单状态为已支付，就可能出现消息重复投递的情况。如果消费者不做判断，很有可能导致消息被消费多次，出现业务故障。

举例：

1. 假如用户刚刚支付完成，并且投递消息到交易服务，交易服务更改订单为**已支付**状态。
2. 由于某种原因，例如网络故障导致生产者没有得到确认，隔了一段时间后**重新投递**给交易服务。
3. 但是，在新投递的消息被消费之前，用户选择了退款，将订单状态改为了**已退款**状态。
4. 退款完成后，新投递的消息才被消费，那么订单状态会被再次改为**已支付**。业务异常。

因此，我们必须想办法保证消息处理的幂等性。这里给出两种方案：

- 唯一消息ID
- 业务状态判断

### 3.4.1、唯一消息ID

这个思路非常简单：

1. 每一条消息都生成一个唯一的id，与消息一起投递给消费者。
2. 消费者接收到消息后处理自己的业务，业务处理成功后将消息ID保存到数据库
3. 如果下次又收到相同消息，去数据库查询判断是否存在，存在则为重复消息放弃处理。

我们该如何给消息添加唯一ID呢？

其实很简单，SpringAMQP的MessageConverter自带了MessageID的功能，我们只要开启这个功能即可。

以Jackson的消息转换器为例：

```Java
 @Bean
    public MessageConverter messageConverter() {
        //1、定义消息转换器
        Jackson2JsonMessageConverter jackson2JsonMessageConverter = new Jackson2JsonMessageConverter();
        //2、配置每条消息自动创建id；用于识别不同消息，也可以在页面中基于id判断是否是重复消息
        jackson2JsonMessageConverter.setCreateMessageIds(true);
        return jackson2JsonMessageConverter;
    }
```

测试：在代码中任意发一条消息；然后在控制台都能够查看到消息的ID。

### 3.4.2、业务判断

业务判断就是基于业务本身的逻辑或状态来判断是否是重复的请求或消息，不同的业务场景判断的思路也不一样。

例如我们当前案例中，处理消息的业务逻辑是把订单状态从未支付修改为已支付。因此我们就可以在执行业务时判断订单状态是否是未支付，如果不是则证明订单已经被处理过，无需重复处理。

相比较而言，消息ID的方案需要改造原有的数据库，所以更推荐使用业务判断的方案。

以支付修改订单的业务为例，我们需要修改`hmall\trade-service\src\main\java\com\hmall\trade\service\impl\OrderServiceImpl.java`中的`markOrderPaySuccess`方法：

```java
public void markOrderPaySuccess(Long orderId) {
        //查找订单
        Order old = getById(orderId);
        //判断订单状态
        if (old == null || old.getStatus() != 1) {
            //订单不存在或订单状态不为1（待支付）；放弃更新状态
            return;
        }
        //修改订单状态
        Order order = new Order();
        order.setId(orderId);
        order.setStatus(2);
        order.setPayTime(LocalDateTime.now());
        updateById(order);
    }
```

上述代码逻辑上符合了幂等判断的需求，但是由于判断和更新是两步动作，因此在极小概率下可能存在线程安全问题。

我们可以合并上述操作为这样：

```java
public void markOrderPaySuccess(Long orderId) {
        // update `order` set `status` = 2, `pay_time` = now() where `id` = orderId and `status` = 1;
        lambdaUpdate()
                .set(Order::getStatus, 2)
                .set(Order::getPayTime, LocalDateTime.now())
                .eq(Order::getId, orderId)
                .eq(Order::getStatus, 1)
                .update();
    }
```

我们在where条件中除了判断id以外，还加上了status必须为1的条件。如果条件不符（说明订单已支付），则SQL匹配不到数据，根本不会执行。

## 3.5、兜底方案

虽然我们利用各种机制尽可能增加了消息的可靠性，但也不好说能保证消息100%的可靠。万一真的MQ通知失败该怎么办呢？

- 接收MQ的消息是被动接收
- 兜底方案可以**主动去查**

比如：在订单支付状态的更新；有没有其它兜底方案，能够确保订单的支付状态一致呢？

其实思想很简单：既然MQ通知不一定发送到交易服务，那么交易服务就必须自己**主动去查询**支付状态。这样即便支付服务的MQ通知失败，我们依然能通过主动查询来保证订单状态的一致。

流程如下：

![order_pay_plb](/assets/images/Java/微服务框架/RabbitMQ-高级/order_pay_plb.png)

图中黄色线圈起来的部分就是MQ通知失败后的兜底处理方案，由交易服务自己主动去查询支付状态。

不过需要注意的是，交易服务并不知道用户会在什么时候支付，如果查询的时机不正确（比如查询的时候用户正在支付中），可能查询到的支付状态也不正确。

那么问题来了，我们到底该在什么时间主动查询支付状态呢？

这个时间是无法确定的，因此，通常我们采取的措施就是利用**定时任务**定期查询，例如每隔20秒就查询一次，并判断支付状态。如果发现订单已经支付，则立刻更新订单状态为已支付即可。

定时任务大家之前学习过，具体的实现这里就不再赘述了。

至此，消息可靠性的问题已经解决了。

综上，支付服务与交易服务之间的订单状态一致性是如何保证的？

- 首先，支付服务会正在用户支付成功以后利用MQ消息通知交易服务，完成订单状态同步。
- 其次，为了保证MQ消息的可靠性，我们采用了生产者确认机制、消费者确认、消费者失败重试等策略，确保消息投递的可靠性
- 最后，我们还在交易服务设置了定时任务，定期查询订单支付状态。这样即便MQ通知失败，还可以利用定时任务作为兜底方案，确保订单支付状态的最终一致性。

# 4、延迟消息

在电商的支付业务中，对于一些库存有限的商品，为了更好的用户体验，通常都会在用户下单时立刻扣减商品库存。例如电影院购票、高铁购票，下单后就会锁定座位资源，其他人无法重复购买。

但是这样就存在一个问题，假如用户下单后一直不付款，就会一直占有库存资源，导致其他客户无法正常交易，最终导致商户利益受损！

因此，电商中通常的做法就是：**对于超过一定时间未支付的订单，应该立刻取消订单并释放占用的库存**。

例如，订单支付超时时间为30分钟，则我们应该在用户下单后的第30分钟检查订单支付状态，如果发现未支付，应该立刻取消订单，释放库存。

但问题来了：如何才能准确的实现在下单后第30分钟去检查支付状态呢？

像这种在一段时间以后才执行的任务，我们称之为**延迟任务**，而要实现延迟任务，最简单的方案就是利用MQ的延迟消息了。

**延迟消息**：生产者发送消息时指定一个时间，消费者不会立刻收到消息，而是在指定时间之后才收到消息。

在RabbitMQ中实现延迟消息也有两种方案：

- 死信交换机+TTL
- 延迟消息插件

这一章我们就一起研究下这两种方案的实现方式，以及优缺点。

## 4.1、死信交换机

首先我们来学习一下基于死信交换机的延迟消息方案。

### 4.1.1、死信交换机

什么是死信？

当一个队列中的消息满足下列情况之一时，可以成为死信（dead letter）：

- 消费者使用`basic.reject`或 `basic.nack`声明消费失败，并且消息的`requeue`参数设置为false
- 消息是一个过期消息，超时无人消费
- 要投递的队列消息满了，无法投递

如果一个队列中的消息已经成为死信，并且这个队列通过**`dead-letter-exchange`**属性指定了一个交换机，那么队列中的死信就会投递到这个交换机中，而这个交换机就称为**死信交换机**（Dead Letter Exchange）。而此时加入有队列与死信交换机绑定，则最终死信就会被投递到这个队列中。

![image-20240120205028064](/assets/images/Java/微服务框架/RabbitMQ-高级/image-20240120205028064.png)

在控制台中演示上述图效果：

创建 simple.queue2 队列，并设置 `x-dead-letter-exchange` 为 `dlx.direct`

![image-20240120205219825](/assets/images/Java/微服务框架/RabbitMQ-高级/image-20240120205219825.png)

创建普通队列 dlx.queue

![image-20240120205301568](/assets/images/Java/微服务框架/RabbitMQ-高级/image-20240120205301568.png)

创建 simple.direct 交换机并绑定 simple.queue2

![image-20240120205605428](/assets/images/Java/微服务框架/RabbitMQ-高级/image-20240120205605428.png)

![image-20240120205634081](/assets/images/Java/微服务框架/RabbitMQ-高级/image-20240120205634081.png)

![image-20240120205535366](/assets/images/Java/微服务框架/RabbitMQ-高级/image-20240120205535366.png)

类似上述方式；创建 dlx.direct 交换机并绑定 dlx.queue

![image-20240120205747089](/assets/images/Java/微服务框架/RabbitMQ-高级/image-20240120205747089.png)

在 `com.itheima.publisher.amqp.SpringAmqpTest` 编写发送消息到 `simple.direct` 的代码：

```java
/**
     * 发送过期消息到 simple.direct 交换机
     */
    @Test
    public void testSendExpiredMessage() {
        // 发送 10s 过期消息
        System.out.println("发送时间：" + LocalTime.now());
        rabbitTemplate.convertAndSend("simple.direct", "", "hello delay message. ", new MessagePostProcessor() {
            @Override
            public Message postProcessMessage(Message message) throws AmqpException {
                message.getMessageProperties().setExpiration("10000");
                return message;
            }
        });
    }
```

在 `com.itheima.consumer.listener.SpringRabbitListener` 编写监听 `dlx.queue` 的代码：

```java
 /*
    监听 dlx.queue 队列的消息
     */
    @RabbitListener(queues = "dlx.queue")
    public void listenDlxQueueMessage(String message) throws Exception {
        System.out.println("SpringRabbitListener listenDlxQueueMessage 消费者接收到消息: " + message + " " + LocalTime.now());
    }
```

死信交换机有什么作用呢？

1. 收集那些因处理失败而被拒绝的消息
2. 收集那些因队列满了而被拒绝的消息
3. 收集因TTL（有效期）到期的消息

### 4.1.2、携带RoutingKey（了解）

前面两种作用场景可以看做是把死信交换机当做一种消息处理的最终兜底方案，与消费者重试时讲的`RepublishMessageRecoverer`作用类似。

如果有携带Routingkey的延迟消息；可以了解如下图示（课上不再演示）：

如图，有一组绑定的交换机（`ttl.fanout`）和队列（`ttl.queue`）。但是`ttl.queue`没有消费者监听，而是设定了死信交换机`hmall.direct`，而队列`direct.queue1`则与死信交换机绑定，RoutingKey是blue：

![image-20240120203801991](/assets/images/Java/微服务框架/RabbitMQ-高级/image-20240120203801991.png)

假如我们现在发送一条消息到`ttl.fanout`，RoutingKey为blue，并设置消息的**有效期**为5000毫秒：

![image-20240120203857929](/assets/images/Java/微服务框架/RabbitMQ-高级/image-20240120203857929.png)

> **注意**：尽管这里的`ttl.fanout`不需要RoutingKey，但是当消息变为死信并投递到死信交换机时，会沿用之前的RoutingKey，这样`hmall.direct`才能正确路由消息。

消息肯定会被投递到`ttl.queue`之后，由于没有消费者，因此消息无人消费。5秒之后，消息的有效期到期，成为死信：

![image-20240120204048525](/assets/images/Java/微服务框架/RabbitMQ-高级/image-20240120204048525.png)

死信被再次投递到死信交换机`hmall.direct`，并沿用之前的RoutingKey，也就是`blue`：

![image-20240120204124132](/assets/images/Java/微服务框架/RabbitMQ-高级/image-20240120204124132.png)

由于`direct.queue1`与`hmall.direct`绑定的key是blue，因此最终消息被成功路由到`direct.queue1`，如果此时有消费者与`direct.queue1`绑定， 也就能成功消费消息了。但此时已经是5秒钟以后了：

![image-20240120204200078](/assets/images/Java/微服务框架/RabbitMQ-高级/image-20240120204200078.png)

也就是说，publisher发送了一条消息，但最终consumer在5秒后才收到消息。我们成功实现了**延迟消息**。

> **注意：**
>
> RabbitMQ的消息过期是基于追溯方式来实现的，也就是说当一个消息的TTL到期以后不一定会被移除或投递到死信交换机，而是在消息恰好处于队首时才会被处理。
>
> 当队列中消息堆积很多的时候，过期消息可能不会被按时处理，因此你设置的TTL时间不一定准确。

## 4.2、延迟消息插件

基于死信队列虽然可以实现延迟消息，但是太麻烦了。因此RabbitMQ社区提供了一个延迟消息插件来实现相同的效果。

官方文档说明：https://blog.rabbitmq.com/posts/2015/04/scheduling-messages-with-rabbitmq

### 4.2.1、下载

插件下载地址：

[Tags · rabbitmq/rabbitmq-delayed-message-exchange · GitHub](https://github.com/rabbitmq/rabbitmq-delayed-message-exchange/tags)

由于我们安装的MQ是`3.8`版本，因此这里下载`3.8.17`版本：

![image-20240120211013680](/assets/images/Java/微服务框架/RabbitMQ-高级/image-20240120211013680.png)

当然，也可以直接使用资料提供好的插件；`资料/rabbitmq_delayed_message_exchange-3.8.17.8f537ac.ez`

### 4.2.2、安装

因为我们是基于Docker安装，所以需要先查看RabbitMQ的插件目录对应的数据卷。

```sh
docker volume inspect mq-plugins
```

结果如下：

```sh
[root@itheima ~]# docker volume inspect mq-plugins
[
    {
        "CreatedAt": "2024-01-17T20:25:10+08:00",
        "Driver": "local",
        "Labels": null,
        "Mountpoint": "/var/lib/docker/volumes/mq-plugins/_data",
        "Name": "mq-plugins",
        "Options": null,
        "Scope": "local"
    }
]

```

插件目录被挂载到了`/var/lib/docker/volumes/mq-plugins/_data`这个目录，我们上传插件到该目录下。

![image-20240120211421172](/assets/images/Java/微服务框架/RabbitMQ-高级/image-20240120211421172.png)

接下来进入mq容器执行命令，安装插件：

```sh
docker exec -it mq rabbitmq-plugins enable rabbitmq_delayed_message_exchange
```

执行上述命令后再重启mq容器；结果如下：

![image-20240120213348943](/assets/images/Java/微服务框架/RabbitMQ-高级/image-20240120213348943.png)

### 4.2.3、声明延迟交换机

1）基于注解方式；并接收消息

修改 `com.itheima.consumer.listener.SpringRabbitListener` 新增如下方法：

```java
 /*
    监听 delay.queue 队列的消息
     */
    @RabbitListener(bindings = @QueueBinding(
            value = @Queue(value = "delay.queue", durable = "true"),
            exchange = @Exchange(value = "delay.direct",delayed = "true"),
            key = "delay"
    ))
    public void listenDelayQueueMessage(String message) throws Exception {
        System.out.println("SpringRabbitListener listenDelayQueueMessage 消费者接收delay.queue的延迟消息: " + message + " " + LocalTime.now());
    }
```

2）基于 `@Bean`方式声明

创建 `com.itheima.consumer.config.DelayExchangeConfig` 代码如下：

```java
package com.itheima.consumer.config;

import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DelayExchangeConfig {

    //定义名字为 delay.direct的延时 direct类型的交换机
    public DirectExchange delayDirectExchange() {
        return ExchangeBuilder.directExchange("delay.direct")
                .delayed()
                .durable(true)
                .build();
    }

    //定义名字为 delay.queue 的队列
    public Queue delayQueue() {
        return new Queue("delay.queue");
    }
    //绑定队列和交换机
    public Binding delayBinding(Queue delayQueue, DirectExchange delayDirectExchange) {
        return BindingBuilder.bind(delayQueue).to(delayDirectExchange).with("delay");
    }
}

```

### 4.2.4、发送延迟消息

在 `com.itheima.publisher.amqp.SpringAmqpTest` 编写发送消息到 `delay.direct` 的代码：

```java
/**
     * 发送到 delay.direct 交换机的延迟消息；延迟5秒
     */
    @Test
    public void testDelayMessage() {
        // 发送 5s 过期消息
        System.out.println("发送时间：" + LocalTime.now());
        rabbitTemplate.convertAndSend("delay.direct", "delay", "hello, delay message ", new MessagePostProcessor() {
            @Override
            public Message postProcessMessage(Message message) throws AmqpException {
                message.getMessageProperties().setDelay(5000);
                return message;
            }
        });
    }
```

> **注意：**
>
> 延迟消息插件内部会维护一个本地数据库表，同时使用Erlang Timers功能实现计时。如果消息的延迟时间设置较长，可能会导致堆积的延迟消息非常多，会带来较大的CPU开销，同时延迟消息的时间会存在误差。
>
> 因此，**不建议设置延迟时间过长的延迟消息**。

## 4.3、超时订单问题

### 4.3.1、需求描述

在交易服务中利用延迟消息实现订单超时取消功能。

其大概思路如下：

![image-20240120214840694](/assets/images/Java/微服务框架/RabbitMQ-高级/image-20240120214840694.png)

假如订单超时支付时间为30分钟，理论上说我们应该在下单时发送一条延迟消息，延迟时间为30分钟。这样就可以在接收到消息时检验订单支付状态，关闭未支付订单。

但是大多数情况下用户支付都会在1分钟内完成，我们发送的消息却要在MQ中停留30分钟，额外消耗了MQ的资源。因此，我们最好多检测几次订单支付状态，而不是在最后第30分钟才检测。

例如：我们在用户下单后的第10秒、20秒、30秒、45秒、60秒、1分30秒、2分、...30分分别设置延迟消息，如果提前发现订单已经支付，则后续的检测取消即可。

这样就可以有效避免对MQ资源的浪费了。

优化后的实现思路如下：

![image-20240120215538319](/assets/images/Java/微服务框架/RabbitMQ-高级/image-20240120215538319.png)

由于我们要多次发送延迟消息，因此需要先定义一个记录消息延迟时间的消息体，处于通用性考虑，我们将其定义到`hm-common`模块下：

编写多个延迟时间点的消息体 `hmall\hm-common\src\main\java\com\hmall\common\domain\MultiDelayMessage.java` 代码如下：

```java
package com.hmall.common.domain;

import com.hmall.common.utils.CollUtils;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class MultiDelayMessage<T> {
    //消息内容
    private T data;
    //记录延迟时间的集合
    private List<Integer> delayMillis;

    public MultiDelayMessage(T data, List<Integer> delayMillis) {
        this.data = data;
        this.delayMillis = delayMillis;
    }

    public static <T> MultiDelayMessage<T> of(T data, Integer... delayMillis) {
        return new MultiDelayMessage<>(data, CollUtils.newArrayList(delayMillis));
    }

    /**
     * 获取并移除下一个延迟时间
     */
    public Integer removeNextDelay() {
        return this.delayMillis.remove(0);
    }
    /**
     * 判断是否还有下一个延迟时间
     */
    public boolean hasNextDelay() {
        return !delayMillis.isEmpty();
    }
}

```

### 4.3.2、定义常量

无论是消息发送还是接收都是在交易服务trade-service完成，因此我们在`trade-service`中定义一个常量类，用于记录交换机、队列、RoutingKey等常量。编写 `hmall\trade-service\src\main\java\com\hmall\trade\constants\TradeMqConstants.java` 代码如下：

```java
package com.hmall.trade.constants;

public interface TradeMqConstants {
    String DELAY_EXCHANGE = "trade.delay.topic";
    String DELAY_ORDER_QUEUE = "trade.order.delay.queue";
    String DELAY_ORDER_ROUTING_KEY = "order.query";
}

```

### 4.3.3、改造下单业务

改造下单业务，在下单完成后，发送延迟消息，查询支付状态。

修改`trade-service`模块的`com.hmall.trade.service.impl.OrderServiceImpl`类的`createOrder`方法，添加消息发送的代码：

![image-20240120232010689](/assets/images/Java/微服务框架/RabbitMQ-高级/image-20240120232010689.png)

### 4.3.4、实现查询支付状态接口

由于MQ消息处理时需要查询支付状态，因此我们要在pay-service模块定义一个这样的接口，并提供对应的FeignClient。

#### 1）创建查询支付单接口

在 `hmall\pay-service\src\main\java\com\hmall\pay\controller\PayController.java` 添加如下方法：

```java
    @ApiOperation("根据订单id查询支付单")
    @GetMapping("/biz/{id}")
    public PayOrderDTO queryPayOrderDTOByBizOrderNo(@PathVariable("id") Long id){
        PayOrder payOrder = payOrderService.lambdaQuery().eq(PayOrder::getBizOrderNo, id).one();
        return BeanUtils.copyBean(payOrder, PayOrderDTO.class);
    }
```

#### 2）创建PayOrderDTO

复制 `hmall\pay-service\src\main\java\com\hmall\pay\domain\vo\PayOrderVO.java`并改名到

`hmall\hm-api\src\main\java\com\hmall\api\dto\PayOrderDTO.java`

#### 3）创建PayClientFallback

编写 `hmall\hm-api\src\main\java\com\hmall\api\fallback\PayClientFallback.java` 内容如下：

```java
package com.hmall.api.fallback;

import com.hmall.api.client.PayClient;
import com.hmall.api.dto.PayOrderDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.openfeign.FallbackFactory;

@Slf4j
public class PayClientFallback implements FallbackFactory<PayClient> {
    public PayClient create(Throwable cause) {
        return new PayClient() {
            @Override
            public PayOrderDTO queryPayOrderDTOByBizOrderNo(Long id) {
                log.error("远程调用PayClient.queryPayOrderByBizOrderNo 失败；参数{}", id, cause);
                return null;
            }
        };
    }
}

```

在 `hmall\hm-api\src\main\java\com\hmall\api\config\DefaultFeignConfig.java` 添加如下代码：

```java
 @Bean
    public PayClientFallback payClientFallback(){
        return new PayClientFallback();
    }
```

#### 4）创建PayClient

编写 `hmall\hm-api\src\main\java\com\hmall\api\client\PayClient.java` 内容如下：

```java
package com.hmall.api.client;

import com.hmall.api.dto.PayOrderDTO;
import com.hmall.api.fallback.PayClientFallback;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(value = "pay-service", fallbackFactory = PayClientFallback.class)
public interface PayClient {

    @GetMapping("/pay-orders/biz/{id}")
    PayOrderDTO queryPayOrderByBizOrderNo(@PathVariable("id") Long id);
}

```

### 4.3.5、监听延迟消息

在trader-service编写一个监听器，监听延迟消息，查询订单支付状态：

`hmall\trade-service\src\main\java\com\hmall\trade\listener\OrderStatusListener.java` 内容如下：

```java
package com.hmall.trade.listener;

import com.hmall.api.client.PayClient;
import com.hmall.api.dto.PayOrderDTO;
import com.hmall.common.domain.MultiDelayMessage;
import com.hmall.trade.constants.TradeMqConstants;
import com.hmall.trade.domain.po.Order;
import com.hmall.trade.service.IOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.core.ExchangeTypes;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.core.MessagePostProcessor;
import org.springframework.amqp.rabbit.annotation.Exchange;
import org.springframework.amqp.rabbit.annotation.Queue;
import org.springframework.amqp.rabbit.annotation.QueueBinding;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OrderStatusListener {

    private final IOrderService orderService;
    private final PayClient payClient;
    private final RabbitTemplate rabbitTemplate;

    /**
     * 监听延迟消息中的订单状态
     * 1、获取订单id
     * 2、查询订单；判断订单状态是否为 未支付；其它则不更新
     * 3、未支付订单，则查询订单信息
     * 3.1、如果支付成功，更新订单状态
     * 3.2、如果还有剩余延迟时间，则继续发送下一个延迟消息；
     * 4、如果超时则取消订单
     */
    @RabbitListener(bindings = @QueueBinding(
            value = @Queue(value = TradeMqConstants.DELAY_ORDER_QUEUE, durable = "true"),
            exchange = @Exchange(value = TradeMqConstants.DELAY_EXCHANGE, delayed = "true", type = ExchangeTypes.TOPIC, durable = "true"),
            key = TradeMqConstants.DELAY_ORDER_ROUTING_KEY
    ))
    public void listenOrderCheckDelayMessage(MultiDelayMessage<Long> message) {
        // 1、获取订单id
        Long orderId = message.getData();
        // 2、查询订单；判断订单状态是否为 未支付；其它则不更新
        Order order = orderService.getById(orderId);
        if (order == null || order.getStatus() > 1) {
            //订单不存在或订单状态已经支付，放弃处理
            return;
        }
        // 3、未支付订单，则查询订单信息
        PayOrderDTO payOrderDTO = payClient.queryPayOrderByBizOrderNo(orderId);

        // 3.1、如果支付成功，更新订单状态
        if (payOrderDTO != null && payOrderDTO.getStatus() == 3) {
            orderService.markOrderPaySuccess(orderId);
            return;
        }
        // 3.2、如果还有剩余延迟时间，则继续发送下一个延迟消息；
        if (message.hasNextDelay()) {
            //① 获取下一个延迟时间
            Integer delayTime = message.removeNextDelay();
            //② 再次发送延迟消息
            rabbitTemplate.convertAndSend(TradeMqConstants.DELAY_EXCHANGE, TradeMqConstants.DELAY_ORDER_ROUTING_KEY, message, new MessagePostProcessor() {
                @Override
                public Message postProcessMessage(Message message) throws AmqpException {
                    message.getMessageProperties().setDelay(delayTime);
                    return message;
                }
            });
            return;
        }
        // 4、如果超时则取消订单；cancelOrder是没有的方法，占个位；后实现
        orderService.cancelOrder(orderId);
    }
}

```

### 4.3.6、测试

启动黑马商城的所有微服务；下单再支付；在上述的监听器中打断点；在未支付之前查看是否有多次的执行。支付之后则不再执行。

# 5、作业

## 5.1、取消订单

在处理超时未支付订单时，如果发现订单确实超时未支付，最终需要关闭该订单。

关闭订单需要完成两件事情：

- 将订单状态修改为已关闭（值为5）
- 恢复订单中已经扣除的商品库存

实现 `com.hmall.trade.service.impl.OrderServiceImpl#cancelOrder` 方法，内容如下：

```java
@Override
    @GlobalTransactional
    public void cancelOrder(Long orderId) {
        //1、更新订单的状态为已关闭
        lambdaUpdate()
                .set(Order::getStatus, 5)
                .set(Order::getCloseTime, LocalDateTime.now())
                .eq(Order::getId, orderId)
                .eq(Order::getStatus, 1)
                .update();
        //2、回退商品库存；商品的购买数在订单详情中
        //根据订单id查询订单详情
        LambdaQueryWrapper<OrderDetail> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(OrderDetail::getOrderId, orderId);
        List<OrderDetail> orderDetails = detailService.list(queryWrapper);
        if (CollUtils.isEmpty(orderDetails)) {
            return;
        }
        List<OrderDetailDTO> orderDetailDTOS = BeanUtils.copyList(orderDetails, OrderDetailDTO.class);
        //将购买数量修改为负数
        for (OrderDetailDTO orderDetailDTO : orderDetailDTOS) {
            orderDetailDTO.setNum(-orderDetailDTO.getNum());
        }

        itemClient.deductStock(orderDetailDTOS);
    }
```

## 5.2、配置重试失败后交换机

- 定义一个自动配置类`MqConsumeErrorAutoConfiguration`，内容包括：
  - 声明一个交换机，名为`error.direct`，类型为`direct`
  - 声明一个队列，名为：`微服务名 + error.queue`，也就是说要动态获取
  - 将队列与交换机绑定，绑定时的`RoutingKey`就是`微服务名`
  - 声明`RepublishMessageRecoverer`，消费失败消息投递到上述交换机
  - 给配置类添加条件，当`spring.rabbitmq.listener.simple.retry.enabled`为`true`时触发

复制 `com.itheima.consumer.config.ErrorMessageConfig` 并修改名字为 `com.hmall.common.config.MqConsumeErrorAutoConfiguration` 内容如下：

```java
package com.hmall.common.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.rabbit.retry.MessageRecoverer;
import org.springframework.amqp.rabbit.retry.RepublishMessageRecoverer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnProperty(name = "spring.rabbitmq.listener.simple.retry.enabled", havingValue = "true")
public class MqConsumeErrorAutoConfiguration {

    //获取当前微服务名
    @Value("${spring.application.name}")
    private String serviceName;

    //定义名字为的error.direct的direct交换机
    @Bean
    public DirectExchange errorDirectExchange() {
        return new DirectExchange("error.direct");
    }
    //定义名字为error.queue的队列
    @Bean
    public Queue errorQueue() {
        return new Queue(serviceName+".error.queue", true);
    }
    //error.direct交换机和error.queue队列绑定
    @Bean
    public Binding errorBinding(Queue errorQueue, DirectExchange errorDirectExchange) {
        return BindingBuilder.bind(errorQueue).to(errorDirectExchange).with(serviceName);
    }

    //设置RabbitTemplate在尝试接收最大次数之后投递的交换机和路由key
    @Bean
    public MessageRecoverer messageRecoverer(RabbitTemplate rabbitTemplate) {
        return new RepublishMessageRecoverer(rabbitTemplate, "error.direct", serviceName);
    }
}

```

访问 nacos ；修改 `shared-mq.yaml` 添加如下内容：

```yml
spring:
  rabbitmq:
    listener:
      simple:
        retry:
          enabled: true
          max-attempts: 3 # 最大重试次数
          initial-interval: 1000 # 重试间隔时间
          multiplier: 1 # 重试间隔时间倍数；下次等待时长 = 上次重试间隔时间（initial-interval） * multiplier
          stateless: true # 是否为无状态的，即重试时会重新获取一次连接；如果包含事务则为 false
```

修改 `hmall\hm-common\src\main\resources\META-INF\spring.factories` 内容添加如下：

![image-20240121194334703](/assets/images/Java/微服务框架/RabbitMQ-高级/image-20240121194334703.png)

启动微服务；查看mq控制台是否有创建各个微服务对应的 `微服务名.error.queue` 队列。

![image-20240121194700719](/assets/images/Java/微服务框架/RabbitMQ-高级/image-20240121194700719.png)
