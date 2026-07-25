将黑马商城拆分为5个微服务：

- 用户服务
- 商品服务
- 购物车服务
- 交易服务
- 支付服务 

由于每个微服务都有不同的地址或端口，入口不同，相信大家在与前端联调的时候发现了一些问题：

- 请求不同数据时要访问不同的入口，需要维护多个入口地址，麻烦
- 前端无法调用nacos，无法实时更新服务列表

单体架构时我们只需要完成一次用户登录、身份校验，就可以在所有业务中获取到用户信息。而微服务拆分后，每个微服务都独立部署，这就存在一些问题：

- 每个微服务都需要编写登录校验、用户信息获取的功能吗？
- 当微服务之间调用时，该如何传递用户信息？

不要着急，这些问题都可以在今天的学习中找到答案，我们会通过**网关**技术解决上述问题。今天的内容会分为3章：

- 第一章：网关路由，解决前端请求入口的问题。
- 第二章：网关鉴权，解决统一登录校验和用户信息获取的问题。
- 第三章：统一配置管理，解决微服务的配置文件重复和配置热更新问题。

通过今天的学习你将掌握下列能力：

- 会利用微服务网关做请求路由
- 会利用微服务网关做登录身份校验
- 会利用Nacos实现统一配置管理
- 会利用Nacos实现配置热更新

好了，接下来我们就一起进入今天的学习吧。



# 1、网关路由

## 1.1、认识网关

什么是网关？

顾明思议，网关就是**网**络的**关**口。数据在网络间传输，从一个网络传输到另一网络时就需要经过网关来做数据的**路由和转发以及数据安全的校验**。

更通俗的来讲，网关就像是以前园区传达室的大爷。

- 外面的人要想进入园区，必须经过大爷的认可，如果你是不怀好意的人，肯定被直接拦截。
- 外面的人要传话或送信，要找大爷。大爷帮你带给目标人。

![image-20240108205508434](/assets/images/Java/微服务框架/SpringCloud-网关与配置/image-20240108205508434.png)

现在，微服务网关就起到同样的作用。前端请求不能直接访问微服务，而是要请求网关：

- 网关可以做安全控制，也就是登录身份校验，校验通过才放行
- 通过认证后，网关再根据请求判断应该访问哪个微服务，将请求转发过去

![gateway001](/assets/images/Java/微服务框架/SpringCloud-网关与配置/gateway001.jpeg)



在SpringCloud当中，提供了两种网关实现方案：

- Netflix Zuul：早期实现，目前已经淘汰
- SpringCloudGateway：基于Spring的WebFlux技术，完全支持响应式编程，吞吐能力更强

课堂中我们以SpringCloudGateway为例来讲解，官方网站：

https://spring.io/projects/spring-cloud-gateway#learn



## 1.2、快速入门

接下来，我们先看下如何利用网关实现请求路由。由于网关本身也是一个独立的微服务，因此也需要创建一个模块开发功能。大概步骤如下：

- 创建网关微服务
- 引入SpringCloudGateway、NacosDiscovery依赖
- 编写启动类
- 配置网关路由

### 1.2.1、创建项目

首先，我们要在hmall下创建一个新的module，命名为`hm-gateway`，作为网关微服务：

![image-20240112113654218](/assets/images/Java/微服务框架/SpringCloud-网关与配置/image-20240112113654218.png)

### 1.2.2、添加依赖

在`hm-gateway`模块的`pom.xml`文件中引入依赖：

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.heima</groupId>
        <artifactId>hmall</artifactId>
        <version>1.0.0</version>
    </parent>

    <artifactId>hm-gateway</artifactId>
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
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-gateway</artifactId>
        </dependency>

        <!--nacos 服务注册发现-->
        <dependency>
            <groupId>com.alibaba.cloud</groupId>
            <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
        </dependency>

        <!--负载均衡-->
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-loadbalancer</artifactId>
        </dependency>
        <!--完成SpringMVC自动装配-->
        <dependency>
            <groupId>org.springframework</groupId>
            <artifactId>spring-webmvc</artifactId>
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

### 1.2.3、启动类

右击 hm-gateway ；选择 `JBLSpringBootAppGen` 创建启动引导类如下：

![image-20240109204211112](/assets/images/Java/微服务框架/SpringCloud-网关与配置/image-20240109204211112.png)

生成的启动引导类 GatewayApplication 代码参考如下：

```java
package com.hmall.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class GatewayApplication {
    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
    }
}

```

### 1.2.4、配置路由

修改上述插件生成的 `hmall\hm-gateway\src\main\resources\application.yml` ；内容如下：

```yml
server:
  port: 8080
spring:
  application:
    name: gateway
  cloud:
    nacos:
      server-addr: 192.168.12.168:8848
    gateway:
      routes:
        - id: item # 路由规则ID，自定义，唯一
          uri: lb://item-service # 路由的目标服务，lb代表负载均衡，会从注册中心拉取服务列表
          predicates: # 路由断言，判断请求是否符合当前规则，符合则路由到目标服务
            - Path=/items/**,/search/** # Path为路由断言，判断请求路径是否符合规则
        - id: cart
          uri: lb://cart-service
          predicates:
            - Path=/carts/**
        - id: user
          uri: lb://user-service
          predicates:
            - Path=/users/**,/addressses/**
        - id: trade
          uri: lb://trade-service
          predicates:
            - Path=/orders/**
        - id: pay
          uri: lb://pay-service
          predicates:
            - Path=/pay-orders/**
```



### 1.2.5、配置启动项

配置 hm-gateway 的启动项：

![image-20240109205630513](/assets/images/Java/微服务框架/SpringCloud-网关与配置/image-20240109205630513.png)

### 1.2.6、测试

启动 GatewayApplication 以及 ItemApplication，以 http://localhost:8080 拼接微服务接口路径来测试。例如：

http://localhost:8080/items/page?pageNo=1&pageSize=1

![image-20240109205701735](/assets/images/Java/微服务框架/SpringCloud-网关与配置/image-20240109205701735.png)

此时，启动UserApplication、CartApplication，然后打开前端页面 http://localhost:18080 ，发现相关功能都可以正常访问了。

## 1.3、路由过滤

路由规则的定义语法如下：

```YAML
spring:
  cloud:
    gateway:
      routes:
        - id: item
          uri: lb://item-service
          predicates:
            - Path=/items/**,/search/**
```

其中上述文件中的 `routes` 对应的Java类型如下：

![image-20240110103952445](/assets/images/Java/微服务框架/SpringCloud-网关与配置/image-20240110103952445.png)

关于在配置文件中的路由，它是一个集合，也就是说可以定义很多路由规则。集合中的`RouteDefinition`就是具体的路由规则定义，其中常见的属性如下：

![image-20240110104156399](/assets/images/Java/微服务框架/SpringCloud-网关与配置/image-20240110104156399.png)

四个属性含义如下：

- `id`：路由的唯一标示
- `predicates`：路由断言，其实就是匹配条件
- `filters`：路由过滤条件，后面讲
- `uri`：路由目标地址，`lb://`代表负载均衡，从注册中心获取目标微服务的实例列表，并且负载均衡选择一个访问。

这里我们重点关注`predicates`，也就是路由断言。SpringCloudGateway中支持的断言类型有很多：

| **名称**   | **说明**                       | **示例**                                                     |
| :--------- | :----------------------------- | :----------------------------------------------------------- |
| After      | 是某个时间点后的请求           | - After=2037-01-20T17:42:47.789-07:00[America/Denver]        |
| Before     | 是某个时间点之前的请求         | - Before=2031-04-13T15:14:47.433+08:00[Asia/Shanghai]        |
| Between    | 是某两个时间点之前的请求       | - Between=2037-01-20T17:42:47.789-07:00[America/Denver], 2037-01-21T17:42:47.789-07:00[America/Denver] |
| Cookie     | 请求必须包含某些cookie         | - Cookie=chocolate, ch.p                                     |
| Header     | 请求必须包含某些header         | - Header=X-Request-Id, \d+                                   |
| Host       | 请求必须是访问某个host（域名） | - Host=**.somehost.org,**.anotherhost.org                    |
| Method     | 请求方式必须是指定方式         | - Method=GET,POST                                            |
| Path       | 请求路径必须符合指定规则       | - Path=/red/{segment},/blue/**                               |
| Query      | 请求参数必须包含指定参数       | - Query=name, Jack或者- Query=name                           |
| RemoteAddr | 请求者的ip必须是指定范围       | - RemoteAddr=192.168.1.1/24                                  |
| weight     | 权重处理                       |                                                              |



# 2、网关登录校验

单体架构时我们只需要完成一次用户登录、身份校验，就可以在所有业务中获取到用户信息。而微服务拆分后，每个微服务都独立部署，不再共享数据。也就意味着每个微服务都需要做登录校验，这显然不可取。

## 2.1、鉴权思路分析

我们的登录是基于JWT来实现的，校验JWT的算法复杂，而且需要用到秘钥。如果每个微服务都去做登录校验，这就存在着两大问题：

- 每个微服务都需要知道JWT的秘钥，不安全
- 每个微服务重复编写登录校验代码、权限校验代码，麻烦

既然网关是所有微服务的入口，一切请求都需要先经过网关。我们完全可以把登录校验的工作放到网关去做，这样之前说的问题就解决了：

- 只需要在网关和用户服务保存秘钥
- 只需要在网关开发登录校验功能

此时，登录校验的流程如图：

![image-20240110141751577](/assets/images/Java/微服务框架/SpringCloud-网关与配置/image-20240110141751577.png)

不过，这里存在几个问题：

- 网关路由是配置的，请求转发是Gateway内部代码，我们如何在转发之前做登录校验？
- 网关校验JWT之后，如何将用户信息传递给微服务？
- 微服务之间也会相互调用，这种调用不经过网关，又该如何传递用户信息？

这些问题将在接下来几节一一解决。

## 2.2、网关过滤器

登录校验必须在请求转发到微服务之前做，否则就失去了意义。而网关的请求转发是`Gateway`内部代码实现的，要想在请求转发之前做登录校验，就必须了解`Gateway`内部工作的基本原理。

![image-20240110142249676](/assets/images/Java/微服务框架/SpringCloud-网关与配置/image-20240110142249676.png)

如图所示：

1. 客户端请求进入网关后由`HandlerMapping`对请求做判断，找到与当前请求匹配的路由规则（**`Route`**），然后将请求交给`WebHandler`去处理。
2. `WebHandler`则会加载当前路由下需要执行的过滤器链（**`Filter chain`**），然后按照顺序逐一执行过滤器（后面称为**`Filter`**）。
3. 图中`Filter`被虚线分为左右两部分，是因为`Filter`内部的逻辑分为`pre`和`post`两部分，分别会在请求路由到微服务**之前**和**之后**被执行。
4. 只有所有`Filter`的`pre`逻辑都依次顺序执行通过后，请求才会被路由到微服务。
5. 微服务返回结果后，再倒序执行`Filter`的`post`逻辑。
6. 最终把响应结果返回。

如图中所示，最终请求转发是有一个名为`NettyRoutingFilter`的过滤器来执行的，而且这个过滤器是整个过滤器链中顺序最靠后的一个。**如果我们能够定义一个过滤器，在其中实现登录校验逻辑，并且将过滤器执行顺序定义到**`NettyRoutingFilter`**之前**，这就符合我们的需求了！

那么，该如何实现一个网关过滤器呢？

网关过滤器链中的过滤器有两种：

- **`GatewayFilter`**：路由过滤器，作用范围比较灵活，可以是任意指定的路由`Route`. 
- **`GlobalFilter`**：全局过滤器，作用范围是所有路由，不可配置。

> **注意**：过滤器链之外还有一种过滤器，HttpHeadersFilter，用来处理传递到下游微服务的请求头。例如org.springframework.cloud.gateway.filter.headers.XForwardedHeadersFilter可以传递代理请求原本的host头到下游微服务。

其实`GatewayFilter`和`GlobalFilter`这两种过滤器的方法签名完全一致：

```Java
/**
 * 处理请求并将其传递给下一个过滤器
 * @param exchange 当前请求的上下文，其中包含request、response等各种数据
 * @param chain 过滤器链，基于它向下传递请求
 * @return 根据返回值标记当前请求是否被完成或拦截，chain.filter(exchange)就放行了。
 */
Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain);
```

`FilteringWebHandler`在处理请求时，会将`GlobalFilter`装饰为`GatewayFilter`，然后放到同一个过滤器链中，排序以后依次执行。

`Gateway`中内置了很多的`GatewayFilter`，详情可以参考官方文档：

https://docs.spring.io/spring-cloud-gateway/docs/3.1.7/reference/html/#gatewayfilter-factories

`Gateway`内置的`GatewayFilter`过滤器使用起来非常简单，无需编码，只要在yaml文件中简单配置即可。而且其作用范围也很灵活，配置在哪个`Route`下，就作用于哪个`Route`.

例如，有一个过滤器叫做`AddRequestHeaderGatewayFilterFacotry`，顾明思议，就是添加请求头的过滤器，可以给请求添加一个请求头并传递到下游微服务。

使用的使用只需要在application.yaml中这样配置：

```YAML
spring:
  cloud:
    gateway:
      routes:
      - id: test_route
        uri: lb://test-service
        predicates:
          -Path=/test/**
        filters:
          - AddRequestHeader=key, value # 逗号之前是请求头的key，逗号之后是value
```

如果想要让过滤器作用于所有的路由，则可以这样配置：

```YAML
spring:
  cloud:
    gateway:
      default-filters: # default-filters下的过滤器可以作用于所有路由
        - AddRequestHeader=key, value
      routes:
      - id: test_route
        uri: lb://test-service
        predicates:
          -Path=/test/**
```

测试自带过滤器；给每个请求设置请求头信息；示例如下：

① 修改 `hmall\hm-gateway\src\main\resources\application.yml` 如下：

```yml
server:
  port: 8080
spring:
  application:
    name: gateway
  cloud:
    nacos:
      server-addr: 192.168.12.168:8848
    gateway:
      routes:
        - id: item # 路由规则ID，自定义，唯一
          uri: lb://item-service # 路由的目标服务，lb代表负载均衡，会从注册中心拉取服务列表
          predicates: # 路由断言，判断请求是否符合当前规则，符合则路由到目标服务
            - Path=/items/**,/search/** # Path为路由断言，判断请求路径是否符合规则
          filters:
            - AddRequestHeader=testStr,tokenValue given by itcast # 添加请求头
        - id: cart
          uri: lb://cart-service
          predicates:
            - Path=/carts/**
        - id: user
          uri: lb://user-service
          predicates:
            - Path=/users/**
        - id: trade
          uri: lb://trade-service
          predicates:
            - Path=/orders/**
        - id: pay
          uri: lb://pay-service
          predicates:
            - Path=/pay-orders/**
      #default-filters: # 全局过滤器，对所有路由生效
      #  - AddRequestHeader=testStr,tokenValue given by itcast global filter # 添加请求头

```

② 修改 `hmall\item-service\src\main\java\com\hmall\item\controller\ItemController.java`

![image-20240110145239932](/assets/images/Java/微服务框架/SpringCloud-网关与配置/image-20240110145239932.png)

③ 测试；访问 [通过网关访问商品列表接口](http://localhost:8080/items/page) ；查看控制台输出：

![image-20240110145308754](/assets/images/Java/微服务框架/SpringCloud-网关与配置/image-20240110145308754.png)

![image-20240110145336538](/assets/images/Java/微服务框架/SpringCloud-网关与配置/image-20240110145336538.png)

## 2.3、自定义过滤器

无论是`GatewayFilter`还是`GlobalFilter`都支持自定义，只不过**编码**方式、**使用**方式略有差别。

### 2.3.1、自定义GlobalFilter

自定义 `GlobalFilter` 需要实现 `GlobalFilter、Order` 两个接口；`GlobalFilter.filter` 方法主要处理过滤逻辑，而 `Order.getOrder` 方法返回的是全局过滤器的执行顺序。

全局过滤器直接实现接口后**不需要在配置文件中配置**，直接可用。

```java
package com.hmall.gateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class MyGlobalFilter implements GlobalFilter, Ordered {
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        //1、获取请求信息
        ServerHttpRequest request = exchange.getRequest();
        //2、处理请求信息
        System.out.println("MyGlobalFilter pre阶段 执行了。 请求路径：" + request.getPath());
        //3、放行
        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        // 返回值越小，越先执行
        return 0;
    }
}

```



如果想要在全局过滤器执行之后做一些业务处理；也可以如下：

```java
package com.hmall.gateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class MyGlobalFilter implements GlobalFilter, Ordered {
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        //1、获取请求信息
        ServerHttpRequest request = exchange.getRequest();
        //2、处理请求信息
        System.out.println("MyGlobalFilter pre阶段 执行了。 请求路径：" + request.getPath());
        //3、放行
        return chain.filter(exchange).then(Mono.fromRunnable(()->{
            System.out.println("MyGlobalFilter post阶段 执行了。");
        }));
    }

    @Override
    public int getOrder() {
        // 返回值越小，越先执行
        return 0;
    }
}

```



### 2.3.2、自定义GatewayFilter

自定义`GatewayFilter`不是直接实现`GatewayFilter`，而是实现`AbstractGatewayFilterFactory`。最简单的方式是这样的：

```java
package com.hmall.gateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class PrintAnyGatewayFilterFactory extends AbstractGatewayFilterFactory<Object> {
    @Override
    public GatewayFilter apply(Object config) {
        return new GatewayFilter() {
            @Override
            public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
                // 获取请求信息
                ServerHttpRequest request = exchange.getRequest();
                // 处理过滤业务逻辑
                System.out.println("PrintAnyGatewayFilterFactory 执行了");
                // 放行
                return chain.filter(exchange);
            }
        };
    }
}

```

**注意**：该类的名称一定要以`GatewayFilterFactory`为后缀！

然后在yaml配置中这样使用：

```yml
spring:
  cloud:
    gateway:
      default-filters:
            - PrintAny # 此处直接以自定义的GatewayFilterFactory类名称前缀类声明过滤器
```

另外，这种过滤器还可以支持动态配置参数，不过实现起来比较复杂，示例：

```java
package com.hmall.gateway.filter;

import lombok.Data;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.OrderedGatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

@Component
public class PrintAnyGatewayFilterFactory extends AbstractGatewayFilterFactory<PrintAnyGatewayFilterFactory.Config> {
    @Override
    public GatewayFilter apply(Config config) {
        /*return new GatewayFilter() {
            @Override
            public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
                // 获取请求信息
                ServerHttpRequest request = exchange.getRequest();
                // 处理过滤业务逻辑
                System.out.println("PrintAnyGatewayFilterFactory 执行了");
                // 放行
                return chain.filter(exchange);
            }
        };*/
        return new OrderedGatewayFilter(new GatewayFilter() {
            @Override
            public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
                // 获取配置的属性值
                String a = config.getA();
                String b = config.getB();
                String c = config.getC();
                System.out.println(" a = " + a);
                System.out.println(" b = " + b);
                System.out.println(" c = " + c);

                return chain.filter(exchange);
            }
        }, 100);
    }

    //定义内部配置类；里面包含过滤器自定义的配置属性
    @Data
    public static class Config {
        private String a;
        private String b;
        private String c;
    }
    //将变量名依次按顺序返回；取对应参数时也需要按照顺序取

    @Override
    public List<String> shortcutFieldOrder() {
        return List.of("a", "b", "c");
    }

    // 将Config字节码传递给父类，父类负责帮我们读取yaml配置
    public PrintAnyGatewayFilterFactory(){
        super(Config.class);
    }

}

```

按照上述过滤器的配置；那么在yaml配置中这样使用：

```yml
spring:
  cloud:
    gateway:
      default-filters:
            - PrintAny=1,2,3
```

## 2.4、登录校验

接下来，我们就利用自定义`GlobalFilter`来完成登录校验。

### 2.4.1、JWT工具

登录校验需要用到JWT，而且JWT的加密需要秘钥和加密工具。这些在`hm-service`中已经有了，我们直接拷贝过来：

![image-20240110182852340](/assets/images/Java/微服务框架/SpringCloud-网关与配置/image-20240110182852340.png)

具体作用如下：

- `AuthProperties`：配置登录校验需要拦截的路径，因为不是所有的路径都需要登录才能访问
- `JwtProperties`：定义与JWT工具有关的属性，比如秘钥文件位置
- `SecurityConfig`：工具的自动装配
- `JwtTool`：JWT工具，其中包含了校验和解析`token`的功能
- `hmall.jks`：秘钥文件

其中`AuthProperties`和`JwtProperties`所需的属性要在`application.yml`中配置：

```YAML
hm:
  jwt:
    location: classpath:hmall.jks # 秘钥地址
    alias: hmall # 秘钥别名
    password: hmall123 # 秘钥文件密码
    tokenTTL: 30m # 登录有效期
  auth:
    excludePaths: # 无需登录校验的路径
      - /search/**
      - /users/login
      - /items/**
```

### 2.4.2、登录校验过滤器

接下来，我们定义一个登录校验的过滤器 `AuthGlobalFilter` ：

![image-20240110185723936](/assets/images/Java/微服务框架/SpringCloud-网关与配置/image-20240110185723936.png)

代码参考如下：

```java
package com.hmall.gateway.filter;

import com.hmall.gateway.config.AuthProperties;
import com.hmall.gateway.util.JwtTool;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
@EnableConfigurationProperties(AuthProperties.class)
@RequiredArgsConstructor
public class AuthGlobalFilter implements GlobalFilter, Ordered {
    private final JwtTool jwtTool;
    private final AuthProperties authProperties;
    private final AntPathMatcher antPathMatcher = new AntPathMatcher();
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        //1、判断是否要拦截
        ServerHttpRequest request = exchange.getRequest();
        if (isExclude(request.getPath().toString())) {
            //无需拦截；直接放行
            return chain.filter(exchange);
        }
        //2、获取token
        String token = request.getHeaders().getFirst("authorization");
        //3、校验token
        Long userId = null;
        try {
            userId = jwtTool.parseToken(token);
            //4、todo 传递用户信息
        	System.out.println(" userId = " + userId);
        } catch (Exception e) {
            //token校验失败
            ServerHttpResponse response = exchange.getResponse();
            response.setStatusCode(HttpStatus.UNAUTHORIZED);
            return response.setComplete();
        }
        
        //5、放行
        return chain.filter(exchange);
    }

    private boolean isExclude(String path) {
        for (String excludePath : authProperties.getExcludePaths()) {
            if (antPathMatcher.match(excludePath, path)) {
                return true;
            }
        }
        return false;
    }

    @Override
    public int getOrder() {
        return 0;
    }
}

```

启动 `hm-gateway、item-service` 测试，会发现访问/items开头的路径，未登录状态下不会被拦截：

![image-20240110185829888](/assets/images/Java/微服务框架/SpringCloud-网关与配置/image-20240110185829888.png)



访问其他路径则，未登录状态下请求会被拦截，并且返回`401`状态码：

![image-20240110185852213](/assets/images/Java/微服务框架/SpringCloud-网关与配置/image-20240110185852213.png)

## 2.5、微服务获取用户

现在，网关已经可以完成登录校验并获取登录用户身份信息。但是当网关将请求转发到微服务时，微服务又该如何获取用户身份呢？

由于网关发送请求到微服务依然采用的是`Http`请求，因此我们可以将用户信息以请求头的方式传递到下游微服务。然后微服务可以从请求头中获取登录用户信息。考虑到微服务内部可能很多地方都需要用到登录用户信息，因此我们可以利用SpringMVC的拦截器来实现登录用户信息获取，并存入ThreadLocal，方便后续使用。

据图流程图如下：

![micro-service-gateway-workflow](/assets/images/Java/微服务框架/SpringCloud-网关与配置/micro-service-gateway-workflow.jpeg)

因此，接下来我们要做的事情有：

- 改造网关过滤器，在获取用户信息后保存到请求头，转发到下游微服务
- 编写微服务拦截器，拦截请求获取用户信息，保存到ThreadLocal后放行



### 2.5.1、保存用户到请求头

首先，我们修改登录校验拦截器（`hmall\hm-gateway\src\main\java\com\hmall\gateway\filter\AuthGlobalFilter.java`）的处理逻辑，保存用户信息到请求头中：

![image-20240110191308140](/assets/images/Java/微服务框架/SpringCloud-网关与配置/image-20240110191308140.png)

### 2.5.2、拦截器获取用户

在`hm-common`中已经有一个用于保存登录用户的 ThreadLocal 工具：其中已经提供了保存和获取用户的方法：

![image-20240110191433009](/assets/images/Java/微服务框架/SpringCloud-网关与配置/image-20240110191433009.png)

接下来，我们只需要编写拦截器，获取用户信息并保存到`UserContext`，然后放行即可。

由于每个微服务都有获取登录用户的需求，因此拦截器我们直接写在`hm-common`中，并写好自动装配。这样微服务只需要引入`hm-common`就可以直接具备拦截器功能，无需重复编写。

我们在`hm-common`模块下定义一个拦截器 `hmall\hm-common\src\main\java\com\hmall\common\interceptor\UserInfoInterceptor.java`：具体代码如下：

```java
package com.hmall.common.interceptor;

import cn.hutool.core.util.StrUtil;
import com.hmall.common.utils.UserContext;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class UserInfoInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // 1、获取请求头中的用户信息
        String userInfo = request.getHeader("user-info");
        // 2、将用户信息放入ThreadLocal中
        if (StrUtil.isNotBlank(userInfo)) {
            // 1、将用户信息放入ThreadLocal中
            UserContext.setUser(Long.valueOf(userInfo));
        }
        // 3、放行
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
        //移除用户信息
        UserContext.removeUser();
    }
}

```



接着在`hm-common`模块下编写`SpringMVC`的配置类（`com.hmall.common.config.MvcConfig`），配置登录拦截器；具体拦截器的代码参考如下：

```java
package com.hmall.common.config;

import com.hmall.common.interceptor.UserInfoInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class MvcConfig implements WebMvcConfigurer {

    //添加拦截器
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new UserInfoInterceptor());
    }
}

```

不过，需要注意的是，这个配置类默认是不会生效的，因为它所在的包是`com.hmall.common.config`，与其它微服务的扫描包不一致，无法被扫描到，因此无法生效。

基于SpringBoot的自动装配原理，我们要将其添加到`resources`目录下的`META-INF/spring.factories`文件中：

![image-20240110192317099](/assets/images/Java/微服务框架/SpringCloud-网关与配置/image-20240110192317099.png)

在 `spring.factories` 中内容如下：

```properties
org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
  com.hmall.common.config.MyBatisConfig,\
  com.hmall.common.config.JsonConfig,\
  com.hmall.common.config.MvcConfig
```



### 2.5.3、恢复购物车代码

之前我们在购物车微服务中无法获取登录用户，所以把购物车服务的登录用户写死了，现在需要恢复到原来的样子。找到`cart-service`模块的`com.hmall.cart.service.impl.CartServiceImpl`修改其中的`queryMyCarts`方法：

![image-20240110192731047](/assets/images/Java/微服务框架/SpringCloud-网关与配置/image-20240110192731047.png)



### 2.5.4、测试

启动 `item-service,cart-service,user-service,hm-gateway`微服务；

访问 [黑马商城--首页](http://localhost:18080/) 进行登录；然后点击 我的购物车；查看当前登录人的购物车数据。

![image-20240110193653842](/assets/images/Java/微服务框架/SpringCloud-网关与配置/image-20240110193653842.png)

## 2.6、OpenFeign传递用户

前端发起的请求都会经过网关再到微服务，由于我们之前编写的过滤器和拦截器功能，微服务可以轻松获取登录用户信息。

但有些业务是比较复杂的，请求到达微服务后还需要调用其它多个微服务。比如下单业务，流程如下：

![service2service-invoke](/assets/images/Java/微服务框架/SpringCloud-网关与配置/service2service-invoke.jpeg)

下单的过程中，需要调用商品服务扣减库存，调用购物车服务清理用户购物车。而清理购物车时必须知道当前登录的用户身份。但是，**订单服务调用购物车时并没有传递用户信息**，购物车服务无法知道当前用户是谁！

由于微服务获取用户信息是通过拦截器在请求头中读取，因此要想实现微服务之间的用户信息传递，就**必须在微服务发起调用时把用户信息存入请求头**。

微服务之间调用是基于OpenFeign来实现的，并不是我们自己发送的请求。我们如何才能让每一个由OpenFeign发起的请求自动携带登录用户信息呢？

这里要借助Feign中提供的一个拦截器接口：`feign.RequestInterceptor`

![image-20240110194035423](/assets/images/Java/微服务框架/SpringCloud-网关与配置/image-20240110194035423.png)

我们只需要实现这个接口，然后实现apply方法，利用`RequestTemplate`类来添加请求头，将用户信息保存到请求头中。这样一来，每次OpenFeign发起请求的时候都会调用该方法，传递用户信息。

由于`FeignClient`全部都是在`hm-api`模块，因此我们在`hm-api`模块的`com.hmall.api.config.DefaultFeignConfig`中编写这个拦截器。

① 在 `hmall\hm-api\pom.xml` 添加如下依赖：

```xml
        <dependency>
            <groupId>com.heima</groupId>
            <artifactId>hm-common</artifactId>
            <version>1.0.0</version>
        </dependency>

```

② 在`hmall\hm-api\src\main\java\com\hmall\api\config\DefaultFeignConfig.java`中添加一个`Bean`：

![image-20240110194950426](/assets/images/Java/微服务框架/SpringCloud-网关与配置/image-20240110194950426.png)

代码参考如下：

```java
package com.hmall.api.config;

import com.hmall.common.utils.UserContext;
import feign.Logger;
import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.springframework.context.annotation.Bean;

public class DefaultFeignConfig {

    //定义feign请求拦截器，设置用户信息
    @Bean
    public RequestInterceptor requestInterceptor(){
        return new RequestInterceptor() {
            @Override
            public void apply(RequestTemplate template) {
                Long userId = UserContext.getUser();
                if(userId!= null){
                    template.header("user-info", userId.toString());
                }
            }
        };
    }

    //配置feign的日志级别
    @Bean
    public Logger.Level feignLoggerLevel(){
        return Logger.Level.FULL;
    }
}

```

好了，现在微服务之间通过OpenFeign调用时也会传递登录用户信息了。



启动所有微服务；测试用户下单；查看下单后；用户的购物车列表中是否数据已经被清空。

① 登录；首页中搜索商品，然后点击 加入购物车；

② 结算

![image-20240110201732922](/assets/images/Java/微服务框架/SpringCloud-网关与配置/image-20240110201732922.png)

③ 提交订单

![image-20240110202341959](/assets/images/Java/微服务框架/SpringCloud-网关与配置/image-20240110202341959.png)

![image-20240110202407596](/assets/images/Java/微服务框架/SpringCloud-网关与配置/image-20240110202407596.png)

④ 再次点击 我的购物车 ；如果购物车列表中没有了刚刚购买的商品；说明feign传递用户是成功的。



# 3、配置管理

到目前为止我们已经解决了微服务相关的几个问题：

- 微服务远程调用
- 微服务注册、发现
- 微服务请求路由、负载均衡
- 微服务登录用户信息传递

不过，现在依然还有几个问题需要解决：

- 网关路由在配置文件中写死了，如果变更必须重启微服务
- 某些业务配置在配置文件中写死了，每次修改都要重启服务
- 每个微服务都有很多重复的配置，维护成本高

这些问题都可以通过统一的**配置管理器服务**解决。而Nacos不仅仅具备注册中心功能，也具备配置管理的功能：

![config-desc-pro.jpeg](/assets/images/Java/微服务框架/SpringCloud-网关与配置/config-desc-pro.jpeg)

微服务共享的配置可以统一交给Nacos保存和管理，在Nacos控制台修改配置后，Nacos会将配置变更推送给相关的微服务，并且无需重启即可生效，实现配置热更新。

网关的路由同样是配置，因此同样可以基于这个功能实现动态路由功能，无需重启网关即可修改路由配置。

## 3.1、配置共享

我们可以把微服务共享的配置抽取到Nacos中统一管理，这样就不需要每个微服务都重复配置了。分为两步：

- 在Nacos中添加共享配置
- 微服务拉取配置

### 3.1.1、添加共享配置

以cart-service为例，我们看看有哪些配置是重复的，可以抽取的：

首先是jdbc及MybatisPlus相关配置：

![image-20240111102019433](/assets/images/Java/微服务框架/SpringCloud-网关与配置/image-20240111102019433.png)

其次是日志配置：

![image-20240111102258757](/assets/images/Java/微服务框架/SpringCloud-网关与配置/image-20240111102258757.png)

然后也有swagger的配置：

![image-20240111102646388](/assets/images/Java/微服务框架/SpringCloud-网关与配置/image-20240111102646388.png)

接下来到nacos控制台分别添加这些公共的配置：

#### 1）数据库共享配置

jdbc数据库相关配置，在`配置管理`->`配置列表`中点击`+`新建一个配置：

![image-20240111103653098](/assets/images/Java/微服务框架/SpringCloud-网关与配置/image-20240111103653098.png)

在弹出的表单中填写信息：

![image-20240111104144279](/assets/images/Java/微服务框架/SpringCloud-网关与配置/image-20240111104144279.png)

其中详细的配置如下：

```yml
spring:
  datasource:
    url: jdbc:mysql://${hm.db.host:192.168.12.168}:${hm.db.port:3306}/${hm.db.database}?useUnicode=true&characterEncoding=UTF-8&autoReconnect=true&serverTimezone=Asia/Shanghai
    driver-class-name: com.mysql.cj.jdbc.Driver
    username: ${hm.db.un:root}
    password: ${hm.db.pw:root}
mybatis-plus:
  configuration:
    default-enum-type-handler: com.baomidou.mybatisplus.core.handlers.MybatisEnumTypeHandler
  global-config:
    db-config:
      update-strategy: not_null
      id-type: auto
```

注意这里的jdbc的相关参数并没有写死，例如：

- `数据库ip`：通过`${hm.db.host:192.168.12.168}`配置了默认值为`192.168.12.168`，同时允许通过`${hm.db.host}`来覆盖默认值
- `数据库端口`：通过`${hm.db.port:3306}`配置了默认值为`3306`，同时允许通过`${hm.db.port}`来覆盖默认值
- `数据库database`：可以通过`${hm.db.database}`来设定，无默认值

#### 2）日志共享配置

日志相关共享配置，在`配置管理`->`配置列表`中点击`+`新建一个配置；命名为 `shared-log.yaml`；配置内容如下：

![image-20240111105607570](/assets/images/Java/微服务框架/SpringCloud-网关与配置/image-20240111105607570.png)

```yaml
logging:
  level:
    com.hmall: debug
  pattern:
    dateformat: HH:mm:ss:SSS
  file:
    path: "logs/${spring.application.name}"
```



#### 3）swagger共享配置

swagger相关共享配置，在`配置管理`->`配置列表`中点击`+`新建一个配置；命名为 `shared-swagger.yaml`；配置内容如下：

![image-20240111105939685](/assets/images/Java/微服务框架/SpringCloud-网关与配置/image-20240111105939685.png)

```yaml
knife4j:
  enable: true
  openapi:
    title: ${hm.swagger.title:黑马商城接口文档}
    description: ${hm.swagger.description:黑马商城接口文档}
    email: ${hm.swagger.email:itheima@itcast.cn}
    concat: ${hm.swagger.concat:itheima}
    url: https://www.itcast.cn
    version: v1.0.0
    group:
      default:
        group-name: default
        api-rule: package
        api-rule-resources:
          - ${hm.swagger.package}

```

注意，这里的swagger相关配置我们没有写死，例如：

- `title`：接口文档标题，我们用了`${hm.swagger.title}`来代替，将来可以有用户手动指定
- `email`：联系人邮箱，我们用了`${hm.swagger.email:itheima@itcast.cn}`，默认值是`itheima@itcast.cn`，同时允许用户利用`${hm.swagger.email}`来覆盖。

### 3.1.2、拉取共享配置

接下来，我们要在微服务拉取共享配置。将拉取到的共享配置与本地的`application.yaml`配置合并，完成项目上下文的初始化。

不过，需要注意的是，读取Nacos配置是SpringCloud上下文（`ApplicationContext`）初始化时处理的，发生在项目的引导阶段。然后才会初始化SpringBoot上下文，去读取`application.yaml`。

也就是说引导阶段，`application.yaml`文件尚未读取，根本不知道nacos 地址，该如何去加载nacos中的配置文件呢？

SpringCloud在初始化上下文的时候会先读取一个名为`bootstrap.yaml`(或者`bootstrap.properties`)的文件，如果我们将nacos地址配置到`bootstrap.yaml`中，那么在项目引导阶段就可以读取nacos中的配置了。

![nacos-config-springboot-workflow.jpeg](/assets/images/Java/微服务框架/SpringCloud-网关与配置/nacos-config-springboot-workflow.jpeg)

因此，微服务整合Nacos配置管理的步骤如下：

#### 1）添加依赖

在cart-service模块引入依赖：

```xml
  <!--nacos配置管理-->
  <dependency>
      <groupId>com.alibaba.cloud</groupId>
      <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
  </dependency>
  <!--读取bootstrap文件-->
  <dependency>
      <groupId>org.springframework.cloud</groupId>
      <artifactId>spring-cloud-starter-bootstrap</artifactId>
  </dependency>
```



#### 2）新建bootstrap.yaml

在cart-service中的resources目录新建一个`bootstrap.yaml`文件；

![image-20240111150627609](/assets/images/Java/微服务框架/SpringCloud-网关与配置/image-20240111150627609.png)

文件内容如下：

```yml
spring:
  application:
    name: cart-service
  cloud:
    nacos:
      server-addr: 192.168.12.168:8848
      config:
        file-extension: yaml # 配置文件后缀名
        shared-configs: # 共享配置
          - dataId: shared-jdbc.yaml # 共享数据库配置
          - dataId: shared-log.yaml # 共享日志配置
          - dataId: shared-swagger.yaml # 共享Swagger配置
  profiles:
    active: dev
```



#### 3）修改application.yaml

在 cart-service 中由于一些配置挪到了`bootstrap.yaml`，因此`application.yaml`需要修改为：

```yml
server:
  port: 8082
feign:
  okhttp:
    enabled: true
hm:
  swagger:
    title: 购物车服务接口文档
    package: com.hmall.cart.controller
  db:
    database: hm-cart
```

重启cart-service服务；发现所有配置都生效。

## 3.2、配置热更新

有很多的业务相关参数，将来可能会根据实际情况临时调整。例如购物车业务，购物车数量有一个上限，默认是10，对应代码如下：

![image-20240111153447484](/assets/images/Java/微服务框架/SpringCloud-网关与配置/image-20240111153447484.png)

现在这里购物车是写死的固定值，我们应该将其配置在配置文件中，方便后期修改。

但现在的问题是，即便写在配置文件中，修改了配置还是需要重新打包、重启服务才能生效。能不能不用重启，直接生效呢？

这就要用到Nacos的配置热更新能力了，分为两步：

- 在Nacos中添加配置
- 在微服务读取配置

### 3.2.1、添加配置到Nacos

首先，我们在nacos中添加一个配置文件，将购物车的上限数量添加到配置中：

![image-20240111154015044](/assets/images/Java/微服务框架/SpringCloud-网关与配置/image-20240111154015044.png)

注意上述填写的`Data ID` 格式：

```
[服务名]-[spring.active.profile].[后缀名]
```

文件名称由三部分组成：

- **`服务名`**：我们是购物车服务，所以是`cart-service`
- **`spring.active.profile`**：就是spring boot中的`spring.active.profile`，该项是可选的。如果没有写，则所有profile共享该配置
- **`后缀名`**：例如yaml

这里我们直接使用`cart-service.yaml`这个名称，则不管是dev还是local环境都可以共享该配置。

配置内容如下：

```yml
hm:
  cart:
    maxAmount: 1 # 购物车商品数量上限
```

发布配置之后，在Nacos控制台查看到新添加的配置：

![image-20240111154152579](/assets/images/Java/微服务框架/SpringCloud-网关与配置/image-20240111154152579.png)

### 3.2.2、配置热更新

接着，我们在微服务中读取配置，实现配置热更新。

在`cart-service`中新建一个属性读取类（`com.hmall.cart.config.CartProperties`）：

![image-20240111160215564](/assets/images/Java/微服务框架/SpringCloud-网关与配置/image-20240111160215564.png)

代码如下：

```java
package com.hmall.cart.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "hm.cart")
public class CartProperties {
    private Integer maxAmount;
}

```

接着，在业务中使用该属性加载类：



![image-20240111160517264](/assets/images/Java/微服务框架/SpringCloud-网关与配置/image-20240111160517264.png)

测试。启动各个微服务及前端；向购物车中添加多个商品，查看是否做到实时地根据 nacos中配置的最大购买数进行限制添加。

![image-20240111161821825](/assets/images/Java/微服务框架/SpringCloud-网关与配置/image-20240111161821825.png)

点击 `加入购物车` 之后；再到控制台看输出信息：

![image-20240111162036074](/assets/images/Java/微服务框架/SpringCloud-网关与配置/image-20240111162036074.png)

我们在nacos控制台，将购物车上限设置为 5：

![image-20240111162240848](/assets/images/Java/微服务框架/SpringCloud-网关与配置/image-20240111162240848.png)

无需要重启；再次测试 加入购物车 可以将商品加入到购物车中，并在购物车列表展示如下：

![image-20240111162436453](/assets/images/Java/微服务框架/SpringCloud-网关与配置/image-20240111162436453.png)

加入成功！

无需重启服务，配置热更新就生效了！

## 3.3、动态路由（课外了解）

此章节的内容；自行了解即可。不用配置。

### 3.3.1、监听Nacos配置变更

在Nacos官网中给出了手动监听Nacos配置变更的SDK：

https://nacos.io/zh-cn/docs/sdk.html

如果希望 Nacos 推送配置变更，可以使用 Nacos 动态监听配置接口来实现。

```Java
public void addListener(String dataId, String group, Listener listener)
```

请求参数说明：

| **参数名** | **参数类型** | **描述**                                                     |
| :--------- | :----------- | :----------------------------------------------------------- |
| dataId     | string       | 配置 ID，保证全局唯一性，只允许英文字符和 4 种特殊字符（"."、":"、"-"、"_"）。不超过 256 字节。 |
| group      | string       | 配置分组，一般是默认的DEFAULT_GROUP。                        |
| listener   | Listener     | 监听器，配置变更进入监听器的回调函数。                       |

示例代码：

```Java
String serverAddr = "{serverAddr}";
String dataId = "{dataId}";
String group = "{group}";
// 1.创建ConfigService，连接Nacos
Properties properties = new Properties();
properties.put("serverAddr", serverAddr);
ConfigService configService = NacosFactory.createConfigService(properties);
// 2.读取配置
String content = configService.getConfig(dataId, group, 5000);
// 3.添加配置监听器
configService.addListener(dataId, group, new Listener() {
        @Override
        public void receiveConfigInfo(String configInfo) {
        // 配置变更的通知处理
                System.out.println("recieve1:" + configInfo);
        }
        @Override
        public Executor getExecutor() {
                return null;
        }
});
```



### 3.3.2、更新路由

更新路由要用到`org.springframework.cloud.gateway.route.RouteDefinitionWriter`这个接口：

```Java
package org.springframework.cloud.gateway.route;

import reactor.core.publisher.Mono;

/**
 * @author Spencer Gibb
 */
public interface RouteDefinitionWriter {
        /**
     * 更新路由到路由表，如果路由id重复，则会覆盖旧的路由
     */
        Mono<Void> save(Mono<RouteDefinition> route);
        /**
     * 根据路由id删除某个路由
     */
        Mono<Void> delete(Mono<String> routeId);

}
```

这里更新的路由，也就是RouteDefinition，之前我们见过，包含下列常见字段：

- id：路由id
- predicates：路由匹配规则
- filters：路由过滤器
- uri：路由目的地

将来我们保存到Nacos的配置也要符合这个对象结构，将来我们以JSON来保存，格式如下：

```JSON
{
  "id": "item",
  "predicates": [{
    "name": "Path",
    "args": {"_genkey_0":"/items/**", "_genkey_1":"/search/**"}
  }],
  "filters": [],
  "uri": "lb://item-service"
}
```

以上JSON配置就等同于：

```YAML
spring:
  cloud:
    gateway:
      routes:
        - id: item
          uri: lb://item-service
          predicates:
            - Path=/items/**,/search/**
```

OK，我们所需要用到的SDK已经齐全了。

### 3.3.3、实现动态路由

首先， 我们在网关gateway引入依赖：

```XML
<!--统一配置管理-->
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
</dependency>
<!--加载bootstrap-->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-bootstrap</artifactId>
</dependency>
```

然后在网关`gateway`的`resources`目录创建`bootstrap.yaml`文件，内容如下：

```YAML
spring:
  application:
    name: gateway
  cloud:
    nacos:
      server-addr: 192.168.150.101
      config:
        file-extension: yaml
        shared-configs:
          - dataId: shared-log.yaml # 共享日志配置
```

接着，修改`gateway`的`resources`目录下的`application.yml`，把之前的路由移除，最终内容如下：

```YAML
server:
  port: 8080 # 端口
hm:
  jwt:
    location: classpath:hmall.jks # 秘钥地址
    alias: hmall # 秘钥别名
    password: hmall123 # 秘钥文件密码
    tokenTTL: 30m # 登录有效期
  auth:
    excludePaths: # 无需登录校验的路径
      - /search/**
      - /users/login
      - /items/**
```

然后，在`gateway`中定义配置监听器：

![image-20240111170451414](/assets/images/Java/微服务框架/SpringCloud-网关与配置/image-20240111170451414.png)

其代码如下：

```Java
package com.hmall.gateway.route;

import cn.hutool.json.JSONUtil;
import com.alibaba.cloud.nacos.NacosConfigManager;
import com.alibaba.nacos.api.config.listener.Listener;
import com.alibaba.nacos.api.exception.NacosException;
import com.hmall.common.utils.CollUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.route.RouteDefinition;
import org.springframework.cloud.gateway.route.RouteDefinitionWriter;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import javax.annotation.PostConstruct;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.Executor;

@Slf4j
@Component
@RequiredArgsConstructor
public class DynamicRouteLoader {

    private final RouteDefinitionWriter writer;
    private final NacosConfigManager nacosConfigManager;

    // 路由配置文件的id和分组
    private final String dataId = "gateway-routes.json";
    private final String group = "DEFAULT_GROUP";
    // 保存更新过的路由id
    private final Set<String> routeIds = new HashSet<>();

    @PostConstruct
    public void initRouteConfigListener() throws NacosException {
        // 1.注册监听器并首次拉取配置
        String configInfo = nacosConfigManager.getConfigService()
                .getConfigAndSignListener(dataId, group, 5000, new Listener() {
                    @Override
                    public Executor getExecutor() {
                        return null;
                    }

                    @Override
                    public void receiveConfigInfo(String configInfo) {
                        updateConfigInfo(configInfo);
                    }
                });
        // 2.首次启动时，更新一次配置
        updateConfigInfo(configInfo);
    }

    private void updateConfigInfo(String configInfo) {
        log.debug("监听到路由配置变更，{}", configInfo);
        // 1.反序列化
        List<RouteDefinition> routeDefinitions = JSONUtil.toList(configInfo, RouteDefinition.class);
        // 2.更新前先清空旧路由
        // 2.1.清除旧路由
        for (String routeId : routeIds) {
            writer.delete(Mono.just(routeId)).subscribe();
        }
        routeIds.clear();
        // 2.2.判断是否有新的路由要更新
        if (CollUtils.isEmpty(routeDefinitions)) {
            // 无新路由配置，直接结束
            return;
        }
        // 3.更新路由
        routeDefinitions.forEach(routeDefinition -> {
            // 3.1.更新路由
            writer.save(Mono.just(routeDefinition)).subscribe();
            // 3.2.记录路由id，方便将来删除
            routeIds.add(routeDefinition.getId());
        });
    }
}
```

重启网关，任意访问一个接口，比如 [localhost:8080/items/page](http://localhost:8080/items/page)：

![image-20240111171327891](/assets/images/Java/微服务框架/SpringCloud-网关与配置/image-20240111171327891.png)

发现是404，无法访问。

接下来，我们直接在Nacos控制台添加路由，路由文件名为`gateway-routes.json`，类型为`json`：

![image-20240111170807575](/assets/images/Java/微服务框架/SpringCloud-网关与配置/image-20240111170807575.png)

配置内容如下：

```json
[
    {
        "id": "item",
        "predicates": [{
            "name": "Path",
            "args": {"_genkey_0":"/items/**", "_genkey_1":"/search/**"}
        }],
        "filters": [],
        "uri": "lb://item-service"
    },
    {
        "id": "cart",
        "predicates": [{
            "name": "Path",
            "args": {"_genkey_0":"/carts/**"}
        }],
        "filters": [],
        "uri": "lb://cart-service"
    },
    {
        "id": "user",
        "predicates": [{
            "name": "Path",
            "args": {"_genkey_0":"/users/**", "_genkey_1":"/addresses/**"}
        }],
        "filters": [],
        "uri": "lb://user-service"
    },
    {
        "id": "trade",
        "predicates": [{
            "name": "Path",
            "args": {"_genkey_0":"/orders/**"}
        }],
        "filters": [],
        "uri": "lb://trade-service"
    },
    {
        "id": "pay",
        "predicates": [{
            "name": "Path",
            "args": {"_genkey_0":"/pay-orders/**"}
        }],
        "filters": [],
        "uri": "lb://pau-service"
    }
]
```



无需重启网关，稍等几秒钟后，再次访问刚才的地址：[localhost:8080/items/page](http://localhost:8080/items/page)

![image-20240111171359745](/assets/images/Java/微服务框架/SpringCloud-网关与配置/image-20240111171359745.png)

