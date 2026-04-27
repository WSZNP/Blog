# 部门管理开发

## 1. 删除部门

### 1.1 需求分析

删除部门数据。在点击 "删除" 按钮，会根据 ID 删除部门数据。

<img src="/assets/images/Java/JavaWeb/后端Web实战(部门管理开发)/image-20231130200858803.png" alt="image-20231130200858803" style="zoom:67%;" />

了解了需求之后，我们再看看接口文档中，关于删除部门的接口的描述，然后根据接口文档进行服务端接口的开发。

<img src="/assets/images/Java/JavaWeb/后端Web实战(部门管理开发)/image-20231130201306202.png" alt="image-20231130201306202" style="zoom: 80%;" />

### 1.2 思路分析

#### 1.2.1 思路说明

明确了删除部门的需求之后，再来梳理一下实现该功能时，三层架构每一层的职责：

<img src="/assets/images/Java/JavaWeb/后端Web实战(部门管理开发)/image-20231130201422073.png" alt="image-20231130201422073" style="zoom: 67%;" />

#### 1.2.1 简单参数接收

我们看到，在 controller 中，需要接收前端传递的请求参数。 那接下来，我们就先来看看在服务器端的 Controller 程序中，如何获取这类简单参数。 具体的方案有如下三种：

**方案一：通过原始的 `HttpServletRequest` 对象获取请求参数**

```java
/**
* 根据ID删除部门 - 简单参数接收: 方式一 (HttpServletRequest)
*/
@DeleteMapping("/depts")
public Result delete(HttpServletRequest request){
		String idStr = request.getParameter("id");
		int id = Integer.parseInt(idStr);

		System.out.println("根据ID删除部门: " + id);
		return Result.success();
}
```

这种方案实现较为繁琐，而且还需要进行手动类型转换。

**方案二：通过 Spring 提供的 `@RequestParam` 注解，将请求参数绑定给方法形参**

```java
@DeleteMapping("/depts")
public Result delete(@RequestParam("id") Integer deptId){
		System.out.println("根据ID删除部门: " + deptId);
		return Result.success();
}
```

`@RequestParam` 注解的 value 属性，需要与前端传递的参数名保持一致 。

> @RequestParam 注解 required 属性默认为 true，代表该参数必须传递，如果不传递将报错。 如果参数可选，可以将属性设置为 false。

**方案三：如果请求参数名与形参变量名相同，直接定义方法形参即可接收。（省略@RequestParam）**

```java
@DeleteMapping("/depts")
public Result delete(Integer id){
		System.out.println("根据ID删除部门: " + deptId);
		return Result.success();
}
```

对于以上的这三种方案呢，我们推荐第三种方案。

### 1.3 代码实现

**1). Mapper 层**

```java
		/**
		 * 根据ID删除部门数据
		 *
		 * # 符号: 占位符，会被 ？替换为预编译的SQL(推荐); 通常用于字段值的替换.
		 * $ 符号: 字符串拼接符号，会将参数直接拼接在SQL语句中(不推荐); 如果需要动态设置表名, 字段名时, 必须使用$符号.
		 */
		@Delete("delete from dept where id = #{id}")
		void delete(Integer id);
```

> 如果 mapper 接口方法形参只有一个普通类型的参数，#{…} 里面的属性名可以随便写，如：#{id}、#{value}。

对于 DML 语句来说，执行完毕，也是有返回值的，返回值代表的是增删改操作，影响的记录数，所以可以将执行 DML 语句的方法返回值设置为 Integer。 但是一般开发时，是不需要这个返回值的，所以也可以设置为 void。

**2). Service 层**

```java
@Override
public void delete(Integer id) {
		//Integer deleted = deptMapper.delete(id);
		//System.out.println("删除数据的结果为: " + deleted);
		deptMapper.delete(id);
}
```

**3). Controller 层**

```java
@DeleteMapping("/depts")
public Result delete(Integer id){
		System.out.println("根据ID删除部门: " + id);
		deptService.delete(id);
		return Result.success();
}
```

代码编写完毕之后，我们就可以启动服务，进行测试了。

![image-20231130203040577](</assets/images/Java/JavaWeb/后端Web实战(部门管理开发)/image-20231130203040577.png>)

### 1.4 Mybatis 中的#与$

在 mybatis 的 mapper 接口中，我们定义 SQL 语句，参数占位符可以使用 `#{...}` 与 `${...}`，那具体什么区别呢？

| **符号** | **说明**                                                  | **场景**                   | **优缺点**            |
| -------- | --------------------------------------------------------- | -------------------------- | --------------------- |
| `#{…}`     | 执行时，会将#{…}替换为?，生成预编译 SQL，并自动设置参数值 | 参数值传递                 | 安全、性能高 （推荐） |
| `${…}`     | 拼接 SQL。直接将参数拼接在 SQL 语句中，存在 SQL 注入问题  | 表名、字段名动态设置时使用 | 不安全、性能低        |

1). 如果我们在定义 SQL 语句的时候，使用的是 `#{...}`

<img src="/assets/images/Java/JavaWeb/后端Web实战(部门管理开发)/image-20231130203428766.png" alt="image-20231130203428766" style="zoom: 80%;" />

我们看到，最终生成的 SQL 语句是预编译的 SQL 语句。

2). 如果我们在定义 SQL 语句的时候，使用的是 `${...}`

<img src="/assets/images/Java/JavaWeb/后端Web实战(部门管理开发)/image-20231130203742136.png" alt="image-20231130203742136" style="zoom: 78%;" />

## 2. 新增部门

### 2.1 需求分析

点击 "新增部门" 的按钮之后，弹出新增部门表单，填写部门名称之后，点击确定之后，保存部门数据。

<img src="/assets/images/Java/JavaWeb/后端Web实战(部门管理开发)/image-20231130204018116.png" alt="image-20231130204018116" style="zoom: 60%;" />

了解了需求之后，我们再看看接口文档中，关于新增部门的接口的描述，然后根据接口文档进行服务端接口的开发 。

<img src="/assets/images/Java/JavaWeb/后端Web实战(部门管理开发)/image-20231130204242647.png" alt="image-20231130204242647" style="zoom:80%;" />

### 2.2 思路分析

#### 2.2.1 思路说明

明确了新增部门的需求之后，再来梳理一下实现该功能时，三层架构每一层的职责：

<img src="/assets/images/Java/JavaWeb/后端Web实战(部门管理开发)/image-20231130204542046.png" alt="image-20231130204542046" style="zoom:80%;" />

#### 2.2.2 json 参数接收

我们看到，在 controller 中，需要接收前端传递的请求参数。 那接下来，我们就先来看看在服务器端的 Controller 程序中，如何获取 json 格式的参数。

- JSON 格式的参数，通常会使用一个实体对象进行接收 。

- 规则：JSON 数据的键名与方法形参对象的属性名相同，并需要使用@RequestBody 注解标识。

​ <img src="/assets/images/Java/JavaWeb/后端Web实战(部门管理开发)/image-20231130205040475.png" alt="image-20231130205040475" style="zoom:75%;" />

​

### 2.3 代码实现

**1). Controller 层**

在`DeptController`中增加方法 add，具体代码如下：

```java
/**
* 添加部门 - json格式参数接收
*/
@Log
@PostMapping
public Result add(@RequestBody Dept dept){
		System.out.println("添加部门: " + dept);
		deptService.add(dept);
		return Result.success();
}
```

**2). Service 层**

在`DeptServiceImpl`中增加 add 方法，完成添加部门的操作，具体代码如下：

```java
@Override
public void add(Dept dept) {
		dept.setCreateTime(LocalDateTime.now());
		dept.setUpdateTime(LocalDateTime.now());
		deptMapper.add(dept);
}
```

**3). Mapper 层**

在 `DeptMapper` 中增加方法 add，完成添加部门的操作具体代码如下：

```java
/**
* 添加部门数据 - 传递多个参数时,可以把多个参数封装到一个对象中 , 然后通过 #{属性名} 来获取对象属性
*/
@Insert("insert into dept(name, create_time, update_time) values(#{name}, #{createTime}, #{updateTime})")
void add(Dept dept);
```

如果在 mapper 接口中，需要传递多个参数，可以把多个参数封装到一个对象中。 在 SQL 语句中获取参数的时候，`#{...}` 里面写的是对象的属性名【注意是属性名，不是表的字段名】。

代码编写完毕之后，我们就可以启动服务，进行测试了。

![image-20231130205630968](</assets/images/Java/JavaWeb/后端Web实战(部门管理开发)/image-20231130205630968.png>)

![image-20231130205652183](</assets/images/Java/JavaWeb/后端Web实战(部门管理开发)/image-20231130205652183.png>)

## 3. 修改部门

对于任何业务的修改功能来说，一般都会分为两步进行：查询回显、修改数据。

<img src="/assets/images/Java/JavaWeb/后端Web实战(部门管理开发)/image-20231130205835988.png" alt="image-20231130205835988" style="zoom:67%;" />

### 3.1 查询回显

#### 3.1.1 需求分析

当我们点击 "编辑" 的时候，需要根据 ID 查询部门数据，然后用于页面回显展示。

![image-20231130210023866](</assets/images/Java/JavaWeb/后端Web实战(部门管理开发)/image-20231130210023866.png>)

#### 3.1.2 思路分析

##### 3.1.2.1 思路说明

明确了根据 ID 查询部门的需求之后，再来梳理一下实现该功能时，三层架构每一层的职责：

<img src="/assets/images/Java/JavaWeb/后端Web实战(部门管理开发)/image-20231130210148744.png" alt="image-20231130210148744" style="zoom:88%;" />

了解了需求之后，我们再看看接口文档中，关于根据 ID 查询部门的接口的描述，然后根据接口文档进行服务端接口的开发 。

<img src="/assets/images/Java/JavaWeb/后端Web实战(部门管理开发)/image-20231130210450314.png" alt="image-20231130210450314" style="zoom:77%;" />

##### 3.1.2.2 路径参数接收

`/depts/1`，`/depts/2` 这种在 url 中传递的参数，我们称之为路径参数。 那么如何接收这样的路径参数呢 ？

路径参数：通过请求 URL 直接传递参数，使用{…}来标识该路径参数，需要使用 @PathVariable 获取路径参数。如下所示：

![image-20231130210741252](</assets/images/Java/JavaWeb/后端Web实战(部门管理开发)/image-20231130210741252.png>)

```java
/**
* 根据ID查询部门数据
* @return
*/
@GetMapping("/{id}")
public Result getInfo(@PathVariable Integer id){
		System.out.println("根据ID查询部门数据: " + id);
		return Result.success();
}
```

##### 3.1.2.3 思考

在 url 中是否可以携带多个路径参数呢 ，如：`/depts/1/0` 。是可以这么传递的，具体的接收方式如下：

```java
@GetMapping("/depts/{id}/{sta}")
public Result getInfo(@PathVariable Integer id, @PathVariable Integer sta){
	//...
}
```

#### 3.1.3 代码实现

**1). Controller 层**

在 `DeptController` 中增加 `getInfo` 方法，具体代码如下：

```java
/**
* 根据ID查询部门数据
*/
@GetMapping("/{id}")
public Result getInfo(@PathVariable Integer id){
		System.out.println("根据ID查询部门数据: " + id);
		Dept dept = deptService.getInfo(id);
		return Result.success(dept);
}
```

**2). Service 层**

在 `DeptServiceImpl` 中增加 `getInfo` 方法，具体代码如下：

```java
@Override
public Dept getInfo(Integer id) {
	return deptMapper.getById(id);
}
```

**3). Mapper 层**

在 `DeptMapper` 中增加 `getById` 方法，具体代码如下：

```java
/**
* 根据ID查询部门数据
*/
@Select("select id, name, create_time, update_time from dept where id = #{id}")
Dept getById(Integer id);
```

代码编写完毕之后，我们就可以启动服务，进行测试了。

![image-20231130211923599](</assets/images/Java/JavaWeb/后端Web实战(部门管理开发)/image-20231130211923599.png>)

### 3.2 修改数据

#### 3.2.1 需求分析

查询回显回来之后，就可以对部门的信息进行修改了，修改完毕之后，点击确定，此时，就需要根据 ID 修改部门的数据。

<img src="/assets/images/Java/JavaWeb/后端Web实战(部门管理开发)/image-20231130212115531.png" alt="image-20231130212115531" style="zoom:80%;" />

了解了需求之后，我们再看看接口文档中，关于修改部门的接口的描述，然后根据接口文档进行服务端接口的开发 。

<img src="/assets/images/Java/JavaWeb/后端Web实战(部门管理开发)/image-20231130212221771.png" alt="image-20231130212221771" style="zoom:67%;" />

#### 3.2.2 思路分析

参照接口文档，梳理三层架构每一层的职责：

<img src="/assets/images/Java/JavaWeb/后端Web实战(部门管理开发)/image-20231130212248232.png" alt="image-20231130212248232" style="zoom:80%;" />

通过接口文档，我们可以看到前端传递的请求参数是 json 格式的请求参数，在 Controller 的方法中，我们可以通过 `@RequestBody` 注解来接收，并将其封装到一个对象中。

#### 3.2.3 代码实现

**1). Controller 层**

在 `DeptController` 中增加 `update` 方法，具体代码如下：

```java
/**
 * 修改部门数据
 */
@PutMapping
public Result update(@RequestBody Dept dept){
		System.out.println("修改部门数据: " + dept);
		deptService.update(dept);
		return Result.success();
}
```

**2). Service 层**

在 `DeptServiceImpl` 中增加 `update` 方法。 由于是修改操作，每一次修改数据，都需要更新 updateTime。所以，具体代码如下：

```java
@Override
public void update(Dept dept) {
		dept.setUpdateTime(LocalDateTime.now());
		deptMapper.update(dept);
}
```

**3). Mapper 层**

在 `DeptMapper` 中增加 `update` 方法，具体代码如下：

```java
/**
 * 根据ID更新部门数据
 */
@Update("update dept set name = #{name}, update_time = #{updateTime} where id = #{id}")
void update(Dept dept);
```

代码编写完毕之后，我们就可以启动服务，进行测试了。

![image-20231130212620460](</assets/images/Java/JavaWeb/后端Web实战(部门管理开发)/image-20231130212620460.png>)

修改完成之后，我们可以看到最新的数据，如下：

![image-20231130212658555](</assets/images/Java/JavaWeb/后端Web实战(部门管理开发)/image-20231130212658555.png>)

#### 3.2.4 @RequestMapping

到此呢，关于基本的部门的增删改查功能，我们已经实现了。 我们会发现，我们在 `DeptController` 中所定义的方法，所有的请求路径，都是 `/depts` 开头的，只要操作的是部门数据，请求路径都是 `/depts` 开头。

那么这个时候，我们其实是可以把这个公共的路径 `/depts` 抽取到类上的，那在各个方法上，就可以省略了这个 `/depts` 路径。 代码如下：

![image-20231130213238682](</assets/images/Java/JavaWeb/后端Web实战(部门管理开发)/image-20231130213238682.png>)

> 一个完整的请求路径，应该是类上的 @RequestMapping 的 value 属性 + 方法上的 @RequestMapping 的 value 属性。

### 3.3 功能优化

#### 3.3.1 问题分析

我们刚才在修改部门数据的时候，是根据 ID 修改所有的部门数据信息，具体的代码如下：

<img src="/assets/images/Java/JavaWeb/后端Web实战(部门管理开发)/image-20231130213505261.png" alt="image-20231130213505261" style="zoom:80%;" />

那我们在更新部门数据时，如何做到只更新其中的某一个或某几个字段呢？比如：

我只想根据 ID 更新部门名称，不更新 updateTime。 按照我们当前编写的 SQL 语句，就会将 update_time 字段置为 null。

<img src="/assets/images/Java/JavaWeb/后端Web实战(部门管理开发)/image-20231130213721555.png" alt="image-20231130213721555" style="zoom:80%;" />

而正常的 SQL 应该是不更新 update_time，如下：

<img src="/assets/images/Java/JavaWeb/后端Web实战(部门管理开发)/image-20231130213806285.png" alt="image-20231130213806285" style="zoom:80%;" />

也就是说，传递了对应的数据值，我就更新对应的字段。如果没有传递，则不更新对应的字段。也就说，这个 SQL 语句，不是固定的，是随着条件动态变化的。 那要想实现这样的效果，就需要用到 Mybatis 中的**动态 SQL**。

#### 3.3.2 功能优化

随着用户的输入或外部条件的变化而变化的 SQL 语句，我们称为 **动态 SQL**。

我们可以将之前在 `DeptMapper` 中`update`方法上定义的 SQL 语句，换成动态 SQL。 具体操作步骤如下：

1). 在 `src/main/resource` 目录下创建文件夹 `com/itheima/mapper`，并在其中定义配置文件，名为 `DeptMapper.xml`

![image-20231130214316168](</assets/images/Java/JavaWeb/后端Web实战(部门管理开发)/image-20231130214316168.png>)

2). 在`DeptMapper.xml` 中基于 Mybatis 中提供的动态 SQL 标签 `<if>` `<set>` 将 SQL 语句改造为动态的。

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
				PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
				"http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.itheima.mapper.DeptMapper">

		<!--动态更新部门数据-->
		<update id="update">
				update dept
				<set>
						<if test="name != null and name != ''">
								name = #{name},
						</if>
						<if test="updateTime != null">
								update_time = #{updateTime}
						</if>
				</set>
				where id = #{id}
		</update>

</mapper>
```

在上述我们使用了，两个动态 SQL 的标签，具体含义如下：

- `<if>`：用于判断条件是否成立。使用 test 属性进行条件判断，如果条件为 true，则拼接 SQL。

- `<set>`：动态地在行首插入 SET 关键字，并会删掉额外的逗号。（用在 update 语句中）

## 4. 日志技术

### 4.1 概述

- 什么时日志？

日志就好比生活中的日记，可以随时随地记录你生活中的点点滴滴。

程序中的日志，是用来记录应用程序的运行信息、状态信息、错误信息的。

- 为什么要在程序中记录日志呢？

  - 便于追踪应用程序中的数据信息、程序的执行过程。
  - 便于对应用程序的性能进行优化。
  - 便于应用程序出现问题之后，排查问题，解决问题。
  - 便于监控系统的运行状态。
  - ... ...

- 之前我们编写程序时，也可以通过 `System.out.println(...) `来输出日志，为什么我们还要学习单独的日志技术呢？

  这是因为，如果通过 `System.out.println(...) ` 来记录日志，会存在以下几点问题：

  - 硬编码。所有的记录日志的代码，都是硬编码，没有办法做到灵活控制，要想不输出这个日志了，只能删除掉记录日志的代码。
  - 只能输出日志到控制台。
  - 不便于程序的扩展、维护。

所以，在现在的项目开发中，我们一般都会使用专业的日志框架，来解决这些问题。

### 4.2 日志框架

<img src="/assets/images/Java/JavaWeb/后端Web实战(部门管理开发)/image-20231130221116386.png" alt="image-20231130221116386" style="zoom:67%;" />

**JUL：** 这是 JavaSE 平台提供的官方日志框架，也被称为 JUL。配置相对简单，但不够灵活，性能较差。

**Log4j：** 一个流行的日志框架，提供了灵活的配置选项，支持多种输出目标。

**Logback：** 基于 Log4j 升级而来，提供了更多的功能和配置选项，性能由于 Log4j。

**Slf4j：**（Simple Logging Facade for Java）简单日志门面，提供了一套日志操作的标准接口及抽象类，允许应用程序使用不同的底层日志框架。

### 4.3 Logback 快速入门

1). 准备工作：引入 logback 的依赖（**springboot 中无需引入，在 springboot 中已经传递了此依赖**）

```xml
<dependency>
		<groupId>ch.qos.logback</groupId>
		<artifactId>logback-classic</artifactId>
		<version>1.4.11</version>
</dependency>
```

2). 引入配置文件 `logback.xml` （资料中已经提供，拷贝进来，放在 `src/main/resources` 目录下）

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
	<!-- 控制台输出 -->
	<appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
		<encoder class="ch.qos.logback.classic.encoder.PatternLayoutEncoder">
			<!--格式化输出：%d表示日期，%thread表示线程名，%-5level：级别从左显示5个字符宽度  %msg：日志消息，%n是换行符 -->
			<pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{50}-%msg%n</pattern>
		</encoder>
	</appender>

	<!-- 日志输出级别 -->
	<root level="ALL">
		<appender-ref ref="STDOUT" />
	</root>
</configuration>
```

3). 记录日志：定义日志记录对象 Logger，记录日志

```java
public class LogTest {

		//定义日志记录对象
		private static final Logger log = LoggerFactory.getLogger(LogTest.class);

		@Test
		public void testLog(){
				log.debug("开始计算...");
				int sum = 0;
				try {
						int[] nums = {1, 5, 3, 2, 1, 4, 5, 4, 6, 7, 4, 34, 2, 23};
						for (int i = 0; i <= nums.length; i++) {
								sum += nums[i];
						}
				} catch (Exception e) {
						log.error("程序运行出错", e);
				}
				log.info("计算结果为: "+sum);
				log.debug("结束计算...");
		}

}
```

运行单元测试，可以在控制台中看到输出的日志，如下所示：

![image-20231130221833741](</assets/images/Java/JavaWeb/后端Web实战(部门管理开发)/image-20231130221833741.png>)

我们可以看到在输出的日志信息中，不仅输出了日志的信息，还包括：日志的输出时间、线程名、具体在那个类中输出的。

### 4.4 Logback 配置文件

Logback 日志框架的配置文件叫 `logback.xml` 。

该配置文件是对 Logback 日志框架输出的日志进行控制的，可以来配置输出的格式、位置及日志开关等。

常用的两种输出日志的位置：控制台、系统文件。

1). 如果需要输出日志到控制台。添加如下配置：

```xml
<!-- 控制台输出 -->
<appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
		<encoder class="ch.qos.logback.classic.encoder.PatternLayoutEncoder">
			<!--格式化输出：%d 表示日期，%thread 表示线程名，%-5level表示级别从左显示5个字符宽度，%msg表示日志消息，%n表示换行符 -->
			<pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{50}-%msg%n</pattern>
		</encoder>
</appender>
```

2). 如果需要输出日志到文件。添加如下配置：

```xml
<!-- 按照每天生成日志文件 -->
<appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
		<rollingPolicy class="ch.qos.logback.core.rolling.SizeAndTimeBasedRollingPolicy">
				<!-- 日志文件输出的文件名, %i表示序号 -->
				<FileNamePattern>D:/tlias-%d{yyyy-MM-dd}-%i.log</FileNamePattern>
				<!-- 最多保留的历史日志文件数量 -->
				<MaxHistory>30</MaxHistory>
				<!-- 最大文件大小，超过这个大小会触发滚动到新文件，默认为 10MB -->
				<maxFileSize>10MB</maxFileSize>
		</rollingPolicy>

		<encoder class="ch.qos.logback.classic.encoder.PatternLayoutEncoder">
				<!--格式化输出：%d 表示日期，%thread 表示线程名，%-5level表示级别从左显示5个字符宽度，%msg表示日志消息，%n表示换行符 -->
				<pattern>%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{50}-%msg%n</pattern>
		</encoder>
</appender>
```

3). 日志开关配置 （开启日志（ALL），取消日志（OFF））

```xml
<!-- 日志输出级别 -->
<root level="ALL">
		<!--输出到控制台-->
		<appender-ref ref="STDOUT" />
		<!--输出到文件-->
		<appender-ref ref="FILE" />
</root>
```

### 4.5 Logback 日志级别

日志级别指的是日志信息的类型，日志都会分级别，常见的日志级别如下（优先级由低到高）：

| **日志级别** | **说明**                                                                    | **记录方式**     |
| ------------ | --------------------------------------------------------------------------- | ---------------- |
| trace        | 追踪，记录程序运行轨迹 【使用很少】                                         | log.trace("...") |
| debug        | 调试，记录程序调试过程中的信息，实际应用中一般将其视为最低级别 【使用较多】 | log.debug("...") |
| info         | 记录程序运行的重要信息，如：数据库连接、网络连接、io 操作 【使用较多】      | log.info("...")  |
| warn         | 警告信息，可能会发生问题 【使用较多】                                       | log.warn("...")  |
| error        | 错误信息 【使用较多】                                                       | log.error("...") |

可以在配置文件`logback.xml`中，灵活的控制输出那些类型的日志。（大于等于配置的日志级别的日志才会输出）

```xml
<!-- 日志输出级别 -->
<root level="info">
		<!--输出到控制台-->
		<appender-ref ref="STDOUT" />
		<!--输出到文件-->
		<appender-ref ref="FILE" />
</root>
```
