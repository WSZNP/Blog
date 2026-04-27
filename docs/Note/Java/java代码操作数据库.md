# 前言

在前面我们学习 MySQL 数据库时，都是利用图形化客户端工具(如：idea、datagrip)，来操作数据库的。

> 在客户端工具中，编写增删改查的 SQL 语句，发给 MySQL 数据库管理系统，由数据库管理系统执行 SQL 语句并返回执行结果。
>
> 增删改操作：返回受影响行数
>
> 查询操作：返回结果集(查询的结果)

我们做为后端程序开发人员，通常会使用 Java 程序来完成对数据库的操作。Java 程序操作数据库的技术呢，有很多啊。

- JDBC：（Java DataBase Connectivity），就是使用 Java 语言操作关系型数据库的一套 API。 【是操作数据库最为基础、底层的技术】

那现在在企业项目开发中呢，一般都会使用基于 JDBC 的封装的高级框架，比如：Mybatis、MybatisPlus、Hibernate、SpringDataJPA。 而这些技术，目前的市场占有份额如下图所示：

<img src="/assets/images/Java/JavaWeb/java代码操作数据库/image-20231130112408855.png" alt="image-20231130112408855" style="zoom:67%;" />

从上图中，我们也可以看到，目前最为主流的就是 Mybatis，其次是 MybatisPlus。

所以，在我们的课程体系中呢，这两种主流的操作数据库的框架我们都要学习。 而我们在学习这两个主流的框架之前，还需要学习一下操作数据库的基础基础 JDBC。 然后接下来，再来学习 Mybatis。 而在我们后面的课程中，我们还要学习 MybatisPlus 框架。 那么今天呢，我们就先来学习 JDBC 和 Mybatis。

我们今天的课程安排如下：

- JDBC
- Mybatis 基础
- 部门列表查询

# 1. JDBC

## 1.1 概述

**JDBC：（Java DataBase Connectivity），就是使用 Java 语言操作关系型数据库的一套 API。**

<img src="/assets/images/Java/JavaWeb/java代码操作数据库/image-20231130113441567.png" alt="image-20231130113441567" style="zoom:80%;" />

> 本质：
>
> - sun 公司官方定义的一套操作所有关系型数据库的规范，即接口。
>
> - 各个数据库厂商去实现这套接口，提供数据库驱动 jar 包。
>
> - 我们可以使用这套接口(JDBC)编程，真正执行的代码是驱动 jar 包中的实现类。

## 1.2 快速入门

**需求：** 通过 JDBC 程序，执行 update 语法，更新用户表中的数据

**步骤：**

- 准备工作：
  - 创建项目，引入 mysql 的驱动、junit 依赖
  - 注册驱动
  - 获取连接对象 Connection
  - 获取 SQL 语句执行对象 Statement
- 执行 SQL 语句
- 释放资源

**演示：**

1. 准备数据库 `web`，及数据库表 `user`

   ```sql
   create database web;
   use web;

   create table user(
   		 id int unsigned primary key auto_increment comment 'ID,主键',
   		 username varchar(20) comment '用户名',
   		 password varchar(32) comment '密码',
   		 name varchar(10) comment '姓名',
   		 age tinyint unsigned comment '年龄'
   ) comment '用户表';

   insert into user(id, username, password, name, age) values (1, 'daqiao', '123456', '大乔', 22),
   																														(2, 'xiaoqiao', '123456', '小乔', 18),
   																														(3, 'diaochan', '123456', '貂蝉', 24),
   																														(4, 'lvbu', '123456', '吕布', 28),
   																														(5, 'zhaoyun', '12345678', '赵云', 27);
   ```

2. 创建一个普通的 maven 项目（非 springboot 项目），引入 mysql 的驱动、junit 依赖

   ```xml
   <dependency>
   		 <groupId>mysql</groupId>
   		 <artifactId>mysql-connector-java</artifactId>
   		 <version>8.0.33</version>
   </dependency>

   <dependency>
   		 <groupId>org.junit.jupiter</groupId>
   		 <artifactId>junit-jupiter</artifactId>
   		 <version>5.9.3</version>
   		 <scope>test</scope>
   </dependency>
   ```

3. 在 `src/test` 目录下创建一个包 `com.itheima.test`，并在其中创建一个测试类 `JDBCTest`，编写入门程序 ，具体如下：

   ```java
   @Test
   public void testUpdate() throws Exception {
   		 //1.准备工作
   		 //1.1 注册驱动
   		 Class.forName("com.mysql.cj.jdbc.Driver");

   		 //1.2 获取连接
   		 String url = "jdbc:mysql://localhost:3306/web";
   		 Connection connection = DriverManager.getConnection(url, "root", "1234");

   		 //1.3 获取SQL语句执行对象
   		 Statement statement = connection.createStatement();

   		 //2.执行SQL
   		 statement.executeUpdate("update user set password = '1234567890' where id = 1");

   		 //3.释放资源
   		 statement.close();
   		 connection.close();
   }
   ```

在上述的步骤中，注册驱动、获取链接 Connection、获取 SQL 语句执行对象 Statement 、释放资源 这几步都是固定步骤，使用 JDBC 程序操作数据库时，这几步都需要做的。

4. 运行单元测试，查看数据库中数据的执行结果。

## 1.3 API 详解

### 1.3.1 DriverManager

**作用：**

- 注册驱动
- 获取数据库链接 Connection

<img src="/assets/images/Java/JavaWeb/java代码操作数据库/image-20231130140042611.png" alt="image-20231130140042611" style="zoom:80%;" />

#### 1.3.1.1 注册驱动

而通过上述的代码，大家可以看到注册驱动，我们是通过 `Class.forName("com.mysql.cj.jdbc.Driver")` 来注册的，看似和 DriverManager 没什么联系。其实不然，`Class.forName("com.mysql.cj.jdbc.Driver")` 只是将 `Driver` 这个类加载到 JVM 中。 而在 `Driver` 这个类中定义了静态代码块，内容如下：

<img src="/assets/images/Java/JavaWeb/java代码操作数据库/image-20231130140632731.png" alt="image-20231130140632731" style="zoom:80%;" />

当 `Driver` 这个类被加载时，就会自动执行静态代码块中的代码，然后就完成了注册驱动的操作。

**备注：**

而其实啊，`Class.forName("com.mysql.cj.jdbc.Driver")` 这句代码呢，是可以省略的，省略了，也可以正常的完成驱动的注册。 原因是因为在 MySQL 的驱动 jar 包中，在 META-INF/services 目录中提供了一个文件 `java.sql.Driver` ，在这个文件中编写了一行内容，就是驱动类的全类名 ：

<img src="/assets/images/Java/JavaWeb/java代码操作数据库/image-20231130145345407.png" alt="image-20231130145345407" style="zoom:80%;" />

当在程序需要用到这个类时，java 会自动加载这个类，这个类一加载 就会自动执行静态代码块中的内容，就完成了注册驱动的操作 ，而 java 中的这个机制称之为 **SPI**。

> SPI 机制：Service Provider Interface，JDK 内置的一种服务提供发现机制，可以轻松的扩展你得程序（切换实现），实现接口与实现类之间的解耦。

#### 1.3.1.2 获取链接

> `DriverManager.getConnection(url, username, password);`

- url: 数据库连接 url

  - 语法：jdbc:mysql://ip 地址(域名):端口号/数据库名?参数键值对 1&参数键值对 2

  - 说明：如果连接的是本机的默认端口的 mysql，url 可以简写为：jdbc:mysql:///数据库名?参数键值对…

- user：用户名

- password：密码

### 1.3.2 Connection & Statement

- Connection 的作用：获取执行 SQL 的对象
  - 执行普通 SQL 对象的 Statement：`connection.createStatement();`
  - 执行预编译 SQL 对象 PreparedStatement：`connection.prepareStatement();` 【后面单独讲解】

​

- Statement 的作用：执行 SQL
  - 执行 DDL、DML 语句：`executeUpdate(sql);` 如果是执行 DML 语句完毕，返回值 int 代表 DML 语句影响的函数 。
  - 执行 SQL 语句：`executeQuery(sql);` 返回值为 ResultSet，里面封装了查询结果。

​

### 1.3.3 ResultSet

​ ![image-20231130153101800](/assets/images/Java/JavaWeb/java代码操作数据库/image-20231130153101800.png)

- 需求：请根据 用户名 与 密码 查询用户的信息，来模拟用户登录操作。

- 实现如下：

  ```java
  @Test
  public void testQuery() throws Exception {
  		//1. 注册驱动
  		Class.forName("com.mysql.cj.jdbc.Driver");

  		//2. 获取链接
  		Connection connection = DriverManager.getConnection("jdbc:mysql://localhost:3306/web01", "root", "root@1234");

  		//3. 获取数据库执行对象 Statement
  		Statement statement = connection.createStatement();

  		//4. 执行SQL
  		ResultSet resultSet = statement.executeQuery("select * from user where username = 'lvbu' and password = '123456'");

  		//5. 获取结果
  		while (resultSet.next()){
  				int id = resultSet.getInt("id");
  				String username = resultSet.getString("username");
  				String password = resultSet.getString("password");
  				String name = resultSet.getString("name");
  				int age = resultSet.getInt("age");
  				System.out.println(new User(id,username,password,name,age));
  		}

  		//6. 释放资源
  		statement.close();
  		connection.close();
  }
  ```

- ResultSet（结果集对象）：封装了 DQL 查询语句查询的结果。

  - next()：将光标从当前位置向前移动一行，并判断当前行是否为有效行，返回值为 boolean。

    - true：有效行，当前行有数据

    - false：无效行，当前行没有数据

  - getXxx(…)：获取数据，可以根据列的编号获取，也可以根据列名获取（推荐）。

​

而上述的单元测试中，我们在 SQL 语句中，将将 用户名 和密码的值都写死了，而这两个值应该是动态的，是将来页面传递到服务端的。 那么，我们可以基于前面所讲解的 JUnit 中的参数化测试进行单元测试，代码改造如下：

```java
		/**
		 * 根据用户名和密码查询用户的基本信息 - 参数化测试
		 */
		@ParameterizedTest
		@CsvSource({"lvbu,123456", "xiaoqiao,123456"})
		public void testQuery2(String _username , String _password) throws Exception {
				//1. 注册驱动
				Class.forName("com.mysql.cj.jdbc.Driver");

				//2. 获取链接
				Connection connection = DriverManager.getConnection("jdbc:mysql://localhost:3306/web01", "root", "root@1234");

				//3. 获取数据库执行对象 Statement
				Statement statement = connection.createStatement();

				//4. 执行SQL
				ResultSet resultSet = statement.executeQuery("select * from user where username = '"+_username+"' and password = '"+_password+"'");

				//5. 获取结果
				while (resultSet.next()){
						int id = resultSet.getInt("id");
						String username = resultSet.getString("username");
						String password = resultSet.getString("password");
						String name = resultSet.getString("name");
						int age = resultSet.getInt("age");
						System.out.println(new User(id,username,password,name,age));
				}

				//6. 释放资源
				statement.close();
				connection.close();
		}
```

如果在测试时，需要传递一组参数，可以使用 `@CsvSource` 注解。

### 1.3.4 PreparedStatement

- 作用：预编译 SQL 语句并执行，可以防止 SQL 注入问题。

- SQL 注入：通过控制输入来修改事先定义好的 SQL 语句，以达到执行代码对服务器进行攻击的方法。

<img src="/assets/images/Java/JavaWeb/java代码操作数据库/image-20231130161328967.png" alt="image-20231130161328967" style="zoom:67%;" />

#### 1.3.4.1 SQL 注入演示

1). 打开课程资料中的文件夹 `资料/02. SQL注入演示`，运行其中的 jar 包 `sql_Injection_demo-0.0.1-SNAPSHOT.jar`，进入该目录后，执行命令：

```
java -jar sql_Injection_demo-0.0.1-SNAPSHOT.jar
```

![image-20231130162011127](/assets/images/Java/JavaWeb/java代码操作数据库/image-20231130162011127.png)

2). 打开浏览器访问 `http://localhost:9090/` ，必须登录后才能访问到系统。我们先测试正常的用户名和密码

![image-20231130162105251](/assets/images/Java/JavaWeb/java代码操作数据库/image-20231130162105251.png)

![image-20231130162112128](/assets/images/Java/JavaWeb/java代码操作数据库/image-20231130162112128.png)

3). 接下来，我们再来测试一下错误的用户名和密码 。

![image-20231130162212300](/assets/images/Java/JavaWeb/java代码操作数据库/image-20231130162212300.png)

我们看到，如果用户名密码错误，是不能进入到系统中进行访问的，会提示 `用户名和密码错误`。

4). 那接下来，我们就要演示一下 SQL 注入现象，我们可以通过控制表单输入，来修改事先定义好的 SQL 语句的含义。 从而来攻击服务器。

![image-20231130162504025](/assets/images/Java/JavaWeb/java代码操作数据库/image-20231130162504025.png)

点击登录后，我们看到居然可以成功进入到系统中。

![image-20231130162527078](/assets/images/Java/JavaWeb/java代码操作数据库/image-20231130162527078.png)

为什么会出现这种现象呢？

在进行登录操作时，怎么样才算登录成功呢？ 如果我们查询到了数据，就说明用户名密码是对的。 如果没有查询到数据，就说明用户名或密码错误。

而出现上述现象，原因就是因为，我们我们编写的 SQL 语句是基于字符串进行拼接的 。 我们输入的用户名无所谓，比如：`shfhsjfhja` ，而密码呢，就是我们精心设计的，如：`' or '1' = '1` 。

那最终拼接的 SQL 语句，如下所示：

![image-20231130163110907](/assets/images/Java/JavaWeb/java代码操作数据库/image-20231130163110907.png)

我们知道，`or` 连接的条件，是或的关系，两者满足其一就可以。 所以，虽然用户名密码输入错误，也是可以查询返回结果的。

#### 1.3.4.2 SQL 注入解决

而我们这小节，所讲解的 `PreparedStatement` 就可以解决 SQL 注入的问题。那么接下来，我们就来演示一下 `PreparedStatement` 的基本使用：

```java
/**
 * 根据用户名和密码查询用户的基本信息 - PreparedStatement
 */
@ParameterizedTest
@CsvSource({"lvbu,123456"})
public void testQuery3(String _username , String _password) throws Exception {
		//1. 注册驱动
		Class.forName("com.mysql.cj.jdbc.Driver");

		//2. 获取链接
		Connection connection = DriverManager.getConnection("jdbc:mysql://localhost:3306/web01", "root", "root@1234");

		//3. 获取数据库执行对象 Statement
		PreparedStatement preparedStatement = connection.prepareStatement("select * from user where username = ? and password = ?");
		preparedStatement.setString(1, _username);
		preparedStatement.setString(2, _password);

		//4. 执行SQL
		ResultSet resultSet = preparedStatement.executeQuery();

		//5. 获取结果
		while (resultSet.next()){
				int id = resultSet.getInt("id");
				String username = resultSet.getString("username");
				String password = resultSet.getString("password");
				String name = resultSet.getString("name");
				int age = resultSet.getInt("age");
				System.out.println(new User(id,username,password,name,age));
		}

		//6. 释放资源
		preparedStatement.close();
		connection.close();
}
```

而 `select * from user where username = ? and password = ?` 这种 SQL 呢，我们称之为预编译 SQL 。那么基于这种预编译 SQL 呢，是可以解决 SQL 注入问题的 。

1). 打开课程资料中的文件夹 `资料/02. SQL注入演示`，运行其中的 jar 包 `sql_prepared_demo-0.0.1-SNAPSHOT.jar`，进入该目录后，执行命令：

```
java -jar sql_prepared_demo-0.0.1-SNAPSHOT.jar
```

![image-20231130164512424](/assets/images/Java/JavaWeb/java代码操作数据库/image-20231130164512424.png)

2). 打开浏览器访问 `http://localhost:9090/` ，必须登录后才能访问到系统 。我们先测试正常的用户名和密码

![image-20231130164551148](/assets/images/Java/JavaWeb/java代码操作数据库/image-20231130164551148.png)

![image-20231130164603041](/assets/images/Java/JavaWeb/java代码操作数据库/image-20231130164603041.png)

3). 那接下来，我们就要演示一下是否可以基于上述的密码 `' or '1' = '1`，来完成 SQL 注入 。

![image-20231130164758504](/assets/images/Java/JavaWeb/java代码操作数据库/image-20231130164758504.png)

通过控制台，可以看到输入的 SQL 语句，是预编译 SQL 语句。

![image-20231130165019265](/assets/images/Java/JavaWeb/java代码操作数据库/image-20231130165019265.png)

而在预编译 SQL 语句中，当我们执行的时候，会把整个`' or '1'='1`作为一个完整的参数，赋值给第 2 个问号（`' or '1'='1`进行了转义，只当做字符串使用）

那么此时再查询时，就查询不到对应的数据了，登录失败。

> 注意：在以后的项目开发中，我们使用的基本全部都是预编译 SQL 语句。
>
> 预编译 SQL 的优势：
>
> - 安全（防止 SQL 注入）
>
> - 性能更高
>
>   ![image-20231130165428348](/assets/images/Java/JavaWeb/java代码操作数据库/image-20231130165428348.png)

# 2. Mybatis 基础

## 2.1 介绍

<img src="/assets/images/Java/JavaWeb/java代码操作数据库/image-20231130165537310.png" alt="image-20231130165537310" style="zoom:80%;" />

什么是 MyBatis?

- MyBatis 是一款优秀的 **持久层** **框架**，用于简化 JDBC 的开发。

- MyBatis 本是 Apache 的一个开源项目 iBatis，2010 年这个项目由 apache 迁移到了 google code，并且改名为 MyBatis 。2013 年 11 月迁移到 Github。

- 官网：https://mybatis.org/mybatis-3/zh/index.html

在上面我们提到了两个词：一个是持久层，另一个是框架。

- 持久层：指的是就是数据访问层(dao)，是用来操作数据库的。

![image-20220901114951631](/assets/images/Java/JavaWeb/java代码操作数据库/image-20220901114951631.png)

- 框架：是一个半成品软件，是一套可重用的、通用的、软件基础代码模型。在框架的基础上进行软件开发更加高效、规范、通用、可拓展。

通过 Mybatis 就可以大大简化原生的 JDBC 程序的代码编写，比如 通过 `select * from user` 查询所有的用户数据，通过 JDBC 程序操作呢，需要大量的代码实现，而如果通过 Mybatis 实现相同的功能，只需要简单的三四行就可以搞定。

![image-20231130170316723](/assets/images/Java/JavaWeb/java代码操作数据库/image-20231130170316723.png)

## 2.2 快速入门

需求：使用 Mybatis 查询所有用户数据 。

### 2.2.1 准备工作

#### 2.2.1.1 创建 springboot 工程

创建 springboot 工程，并导入 mybatis 的起步依赖、mysql 的驱动包、lombok。

 <img src="/assets/images/Java/JavaWeb/java代码操作数据库/image-20231130171224812.png" alt="image-20231130171224812" style="zoom:67%;" />

 <img src="/assets/images/Java/JavaWeb/java代码操作数据库/image-20231130171738067.png" alt="image-20231130171738067" style="zoom: 67%;" />

> 项目工程创建完成后，自动在 pom.xml 文件中，导入 Mybatis 依赖和 MySQL 驱动依赖

```xml
<dependencies>
		<!-- Mybatis的起步依赖 -->
		<dependency>
				<groupId>org.mybatis.spring.boot</groupId>
				<artifactId>mybatis-spring-boot-starter</artifactId>
				<version>3.0.3</version>
		</dependency>

		<!-- MySQL驱动 -->
		<dependency>
				<groupId>com.mysql</groupId>
				<artifactId>mysql-connector-j</artifactId>
				<scope>runtime</scope>
		</dependency>

		<!-- lombok驱动 -->
		<dependency>
				<groupId>org.projectlombok</groupId>
				<artifactId>lombok</artifactId>
				<optional>true</optional>
		</dependency>

		<!-- 单元测试 -->
		<dependency>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-starter-test</artifactId>
				<scope>test</scope>
		</dependency>
</dependencies>
```

#### 2.2.1.2 数据准备

创建用户表 user，并创建对应的实体类 User。

- 用户表（如果已经存在，就不用创建了）

```sql
create table user(
		id int unsigned primary key auto_increment comment 'ID,主键',
		username varchar(20) comment '用户名',
		password varchar(32) comment '密码',
		name varchar(10) comment '姓名',
		age tinyint unsigned comment '年龄'
) comment '用户表';

insert into user(id, username, password, name, age) values (1, 'daqiao', '123456', '大乔', 22),
																													 (2, 'xiaoqiao', '123456', '小乔', 18),
																													 (3, 'diaochan', '123456', '貂蝉', 24),
																													 (4, 'lvbu', '123456', '吕布', 28),
																													 (5, 'zhaoyun', '12345678', '赵云', 27);
```

- 实体类：实体类的属性名与表中的字段名一一对应。

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
		private Integer id; //ID
		private String username; //用户名
		private String password; //密码
		private String name; //姓名
		private Integer age; //年龄
}
```

<img src="/assets/images/Java/JavaWeb/java代码操作数据库/image-20231130173616831.png" alt="image-20231130173616831" style="zoom:80%;" />

#### 2.2.1.3 配置 Mybatis

在 `application.properties` 中配置数据库的连接信息。

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/web01
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.username=root
spring.datasource.password=root@1234
```

> 上述的配置，可以直接复制过去，不要敲错了。 全部都是 spring.datasource.xxxx 开头。

### 2.2.2 编写 SQL 语句

在创建出来的 springboot 工程中，在引导类所在包下，在创建一个包 `mapper` 。在 `mapper` 包下创建一个接口 UserMapper ，这是一个持久层接口（Mybatis 的持久层接口规范一般都叫 XxxMapper）。

**UserMapper 的内容如下：**

```java
import com.itheima.pojo.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import java.util.List;

@Mapper
public interface UserMapper {
		/**
		 * 查询全部
		 */
		@Select("select * from user")
		public List<User> findAll();
}
```

> @Mapper 注解：表示是 mybatis 中的 Mapper 接口
>
> - 程序运行时：框架会自动生成接口的实现类对象(代理对象)，并给交 Spring 的 IOC 容器管理
>
> @Select 注解：代表的就是 select 查询，用于书写 select 查询语句

### 2.2.3 单元测试

在创建出来的 SpringBoot 工程中，在 src 下的 test 目录下，已经自动帮我们创建好了测试类 ，并且在测试类上已经添加了注解 @SpringBootTest，代表该测试类已经与 SpringBoot 整合。

该测试类在运行时，会自动通过引导类加载 Spring 的环境（IOC 容器）。我们要测试那个 bean 对象，就可以直接通过@Autowired 注解直接将其注入进行，然后就可以测试了。

测试类代码如下：

```java
@SpringBootTest
public class MybatisTest {

		@Autowired
		private UserMapper userMapper;

		@Test
		public void testFindAll(){
				List<User> userList = userMapper.findAll();
				userList.forEach(user -> {
						System.out.println(user);
				});
		}

}
```

> 运行结果：
>
> ```
> User(id=1, username=daqiao, password=1234567890, name=大乔, age=22)
> User(id=2, username=xiaoqiao, password=123456, name=小乔, age=18)
> User(id=3, username=diaochan, password=123456, name=貂蝉, age=24)
> User(id=4, username=lvbu, password=123456, name=吕布, age=28)
> User(id=5, username=zhaoyun, password=12345678, name=赵云, age=27)
> ```

<font color='red'> 注意：测试类所在包，需要与引导类所在包相同。</font>

## 2.3 辅助配置

### 2.3.1 配置 SQL 提示

默认我们在 UserMapper 接口上加的 `@Select` 注解中编写 SQL 语句是没有提示的。 如果想让 idea 给我们提示对应的 SQL 语句，我们需要在 IDEA 中配置与 MySQL 数据库的链接。

默认我们在 UserMapper 接口上的 `@Select` 注解中编写 SQL 语句是没有提示的。如果想让 idea 给出提示，可以做如下配置：

![image-20231130174149531](/assets/images/Java/JavaWeb/java代码操作数据库/image-20231130174149531.png)

配置完成之后，发现 SQL 语句中的关键字有提示了，但还存在不识别表名(列名)的情况：

<img src="/assets/images/Java/JavaWeb/java代码操作数据库/image-20231130174210007.png" alt="image-20231130174210007" style="zoom:80%;" />

> 产生原因：Idea 和数据库没有建立连接，不识别表信息
>
> 解决方案：在 Idea 中配置 MySQL 数据库连接

![image-20231130174355957](/assets/images/Java/JavaWeb/java代码操作数据库/image-20231130174355957.png)

> 在配置的时候指定连接那个数据库，如上图所示连接的就是 mybatis 数据库（自己的数据库名是什么就指定什么）。

<font color='red'> 注意：该配置的目的，仅仅是为了在编写 SQL 语句时，有语法提示（写错了会报错），不会影响运行，即使不配置也是可以的。</font>

### 2.3.2 配置 Mybatis 的日志输出

默认情况下，在 Mybatis 中，SQL 语句执行时，我们并看不到 SQL 语句的执行日志。 加入如下配置，即可查看日志：

```properties
#mybatis的配置
mybatis.configuration.log-impl=org.apache.ibatis.logging.stdout.StdOutImpl
```

打开上述开关之后，再次运行单元测试，就可以看到控制台输出的 SQL 语句是什么样子的。

![image-20231130174740269](/assets/images/Java/JavaWeb/java代码操作数据库/image-20231130174740269.png)

## 2.4 JDBC VS Mybatis

JDBC 程序的缺点：

- url、username、password 等相关参数全部硬编码在 java 代码中。
- 查询结果的解析、封装比较繁琐。
- 每一次操作数据库之前，先获取连接，操作完毕之后，关闭连接。 频繁的获取连接、释放连接造成资源浪费。

分析了 JDBC 的缺点之后，我们再来看一下在 mybatis 中，是如何解决这些问题的：

1. 数据库连接四要素(驱动、链接、用户名、密码)，都配置在 springboot 默认的配置文件 application.properties 中

2. 查询结果的解析及封装，由 mybatis 自动完成映射封装，我们无需关注

3. 在 mybatis 中使用了数据库连接池技术，从而避免了频繁的创建连接、销毁连接而带来的资源浪费。

​ <img src="/assets/images/Java/JavaWeb/java代码操作数据库/image-20231130184132204.png" alt="image-20231130184132204" style="zoom: 60%;" />

> 使用 SpringBoot+Mybatis 的方式操作数据库，能够提升开发效率、降低资源浪费

而对于 Mybatis 来说，我们在开发持久层程序操作数据库时，需要重点关注以下两个方面：

1. application.properties

   ```properties
   #驱动类名称
   spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
   #数据库连接的url
   spring.datasource.url=jdbc:mysql://localhost:3306/web01
   #连接数据库的用户名
   spring.datasource.username=root
   #连接数据库的密码
   spring.datasource.password=1234
   ```

2. Mapper 接口（编写 SQL 语句）

   ```java
   @Mapper
   public interface UserMapper {
   		 @Select("select * from user")
   		 public List<User> list();
   }
   ```

## 2.5 数据库连接池

在前面我们所讲解的 mybatis 中，使用了数据库连接池技术，避免频繁的创建连接、销毁连接而带来的资源浪费。

下面我们就具体的了解下数据库连接池。

### 2.5.1 介绍

![image-20221210160341852](/assets/images/Java/JavaWeb/java代码操作数据库/image-20221210160341852.png)

> 没有使用数据库连接池：
>
> - 客户端执行 SQL 语句：要先创建一个新的连接对象，然后执行 SQL 语句，SQL 语句执行后又需要关闭连接对象从而释放资源，每次执行 SQL 时都需要创建连接、销毁链接，这种频繁的重复创建销毁的过程是比较耗费计算机的性能。

<img src="/assets/images/Java/JavaWeb/java代码操作数据库/image-20221210161016314.png" alt="image-20221210161016314" style="zoom:67%;" />

数据库连接池是个容器，负责分配、管理数据库连接(Connection)

- 程序在启动时，会在数据库连接池(容器)中，创建一定数量的 Connection 对象

允许应用程序重复使用一个现有的数据库连接，而不是再重新建立一个

- 客户端在执行 SQL 时，先从连接池中获取一个 Connection 对象，然后在执行 SQL 语句，SQL 语句执行完之后，释放 Connection 时就会把 Connection 对象归还给连接池（Connection 对象可以复用）

释放空闲时间超过最大空闲时间的连接，来避免因为没有释放连接而引起的数据库连接遗漏

- 客户端获取到 Connection 对象了，但是 Connection 对象并没有去访问数据库(处于空闲)，数据库连接池发现 Connection 对象的空闲时间 > 连接池中预设的最大空闲时间，此时数据库连接池就会自动释放掉这个连接对象

数据库连接池的好处：

1. 资源重用
2. 提升系统响应速度
3. 避免数据库连接遗漏

​

​

### 2.5.2 产品

要怎么样实现数据库连接池呢？

- 官方(sun)提供了数据库连接池标准（javax.sql.DataSource 接口）

  - 功能：获取连接

    ```java
    public Connection getConnection() throws SQLException;
    ```

  - 第三方组织必须按照 DataSource 接口实现

常见的数据库连接池：

- C3P0
- DBCP
- Druid
- Hikari (springboot 默认)

现在使用更多的是：Hikari、Druid （性能更优越）

**1). Hikari（追光者） [默认的连接池]**

![image-20231130184846969](/assets/images/Java/JavaWeb/java代码操作数据库/image-20231130184846969.png)

**2). Druid（德鲁伊）**

- Druid 连接池是阿里巴巴开源的数据库连接池项目

- 功能强大，性能优秀，是 Java 语言最好的数据库连接池之一

​

如果我们想把默认的数据库连接池切换为 Druid 数据库连接池，只需要完成以下两步操作即可：

> 参考官方地址：https://github.com/alibaba/druid/tree/master/druid-spring-boot-starter

1. 在 pom.xml 文件中引入依赖

```xml
<dependency>
		<!-- Druid连接池依赖 -->
		<groupId>com.alibaba</groupId>
		<artifactId>druid-spring-boot-starter</artifactId>
		<version>1.2.19</version>
</dependency>
```

2. 在 application.properties 中引入数据库连接配置

```properties
spring.datasource.type=com.alibaba.druid.pool.DruidDataSource
spring.datasource.druid.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.druid.url=jdbc:mysql://localhost:3306/mybatis
spring.datasource.druid.username=root
spring.datasource.druid.password=1234
```

![image-20231130185028717](/assets/images/Java/JavaWeb/java代码操作数据库/image-20231130185028717.png)

## 2.6 Mybatis 的 XML 配置文件

Mybatis 的开发有两种方式：

1. 注解
2. XML

### 2.6.1 XML 配置文件规范

使用 Mybatis 的注解方式，主要是来完成一些简单的增删改查功能。如果需要实现复杂的 SQL 功能，建议使用 XML 来配置映射语句，也就是将 SQL 语句写在 XML 配置文件中。

在 Mybatis 中使用 XML 映射文件方式开发，需要符合一定的规范：

1. XML 映射文件的名称与 Mapper 接口名称一致，并且将 XML 映射文件和 Mapper 接口放置在相同包下（同包同名）

2. XML 映射文件的 namespace 属性为 Mapper 接口全限定名一致

3. XML 映射文件中 sql 语句的 id 与 Mapper 接口中的方法名一致，并保持返回类型一致。

​ <img src="/assets/images/Java/JavaWeb/java代码操作数据库/image-20231130185307759.png" alt="image-20231130185307759" style="zoom: 67%;" />

> \<select>标签：就是用于编写 select 查询语句的。
>
> - resultType 属性，指的是查询返回的单条记录所封装的类型。

### 2.6.2 XML 配置文件实现

**第 1 步：创建 XML 映射文件**

<img src="/assets/images/Java/JavaWeb/java代码操作数据库/image-20231130185553961.png" alt="image-20231130185553961" style="zoom:67%;" />

<img src="/assets/images/Java/JavaWeb/java代码操作数据库/image-20231130185651394.png" alt="image-20231130185651394" style="zoom: 71%;" />

**第 2 步：编写 XML 映射文件**

> xml 映射文件中的 dtd 约束，直接从 mybatis 官网复制即可

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
	PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
	"https://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="">

</mapper>
```

**第 3 步：配置**

**a. XML 映射文件的 namespace 属性为 Mapper 接口全限定名**

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
				PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
				"https://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.itheima.mapper.UserMapper">

</mapper>
```

**b. XML 映射文件中 sql 语句的 id 与 Mapper 接口中的方法名一致，并保持返回类型一致**

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
				PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
				"https://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.itheima.mapper.EmpMapper">

		<!--查询操作-->
		<select id="findAll" resultType="com.itheima.pojo.User">
				select * from user
		</select>
</mapper>
```

运行测试类，执行结果：

![image-20231130190033657](/assets/images/Java/JavaWeb/java代码操作数据库/image-20231130190033657.png)

### 2.6.3 MybatisX 的使用

MybatisX 是一款基于 IDEA 的快速开发 Mybatis 的插件，为效率而生。

MybatisX 的安装：

![image-20221213120923252](/assets/images/Java/JavaWeb/java代码操作数据库/image-20221213120923252.png)

可以通过 MybatisX 快速定位：

<img src="/assets/images/Java/JavaWeb/java代码操作数据库/image-20231130190407501.png" alt="image-20231130190407501" style="zoom:80%;" />

MybatisX 的使用在后续学习中会继续分享

学习了 Mybatis 中 XML 配置文件的开发方式了，大家可能会存在一个疑问：到底是使用注解方式开发还是使用 XML 方式开发？

> 官方说明：https://mybatis.net.cn/getting-started.html
>
> ![image-20220901173948645](/assets/images/Java/JavaWeb/java代码操作数据库/image-20220901173948645.png)

**结论：**使用 Mybatis 的注解，主要是来完成一些简单的增删改查功能。如果需要实现复杂的 SQL 功能，建议使用 XML 来配置映射语句。

# 3. 部门列表查询

## 3.1 功能实现

### 3.1.1 需求

查询数据库表中的所有部门数据，展示在页面上。

![image-20231130190642478](/assets/images/Java/JavaWeb/java代码操作数据库/image-20231130190642478.png)

### 3.1.2 实现

1. 准备数据库表 dept 及 实体类 Dept

   ```sql
   -- 部门管理
   create table dept(
   		 id int unsigned primary key auto_increment comment '主键ID',
   		 name varchar(10) not null unique comment '部门名称',
   		 create_time datetime  comment '创建时间',
   		 update_time datetime  comment '修改时间'
   ) comment '部门表';

   INSERT INTO `dept` VALUES (1,'学工部','2023-09-25 09:47:40','2023-09-25 09:47:40'),
   						(2,'教研部','2023-09-25 09:47:40','2023-09-25 09:47:40'),
   						(3,'咨询部','2023-09-25 09:47:40','2023-09-25 09:47:40'),
   						(4,'就业部','2023-09-25 09:47:40','2023-09-25 09:47:40'),
   						(5,'人事部','2023-09-25 09:47:40','2023-09-25 09:47:40'),
   						(6,'行政部','2023-09-27 14:00:00','2023-09-27 14:00:00'),
   						(7,'综合部','2023-09-25 14:44:19','2023-09-25 14:44:19');
   ```

   ```java
   import lombok.AllArgsConstructor;
   import lombok.Data;
   import lombok.NoArgsConstructor;
   import java.time.LocalDateTime;

   @Data
   @NoArgsConstructor
   @AllArgsConstructor
   public class Dept {
   		 private Integer id;
   		 private String name;
   		 private LocalDateTime createTime;
   		 private LocalDateTime updateTime;
   }

   ```

2. 在项目中引入 Mybatis 的起步依赖，mysql 的驱动包

   ```xml
   <dependency>
   		 <groupId>org.mybatis.spring.boot</groupId>
   		 <artifactId>mybatis-spring-boot-starter</artifactId>
   		 <version>3.0.3</version>
   </dependency>

   <dependency>
   		 <groupId>com.mysql</groupId>
   		 <artifactId>mysql-connector-j</artifactId>
   		 <scope>runtime</scope>
   </dependency>
   ```

3. 在项目的 application.properties 中引入 Mybatis 的配置信息 (数据库连接、日志输出)

   ```properties
   #数据库连接信息
   spring.datasource.url=jdbc:mysql://localhost:3306/web01
   spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
   spring.datasource.username=root
   spring.datasource.password=root@1234

   #mybatis 日志
   mybatis.configuration.log-impl=org.apache.ibatis.logging.stdout.StdOutImpl
   ```

4. 定义 mapper 包，并且定义 DeptMapper 接口，并声明接口方法。

   ```java
   import com.itheima.pojo.Dept;
   import org.apache.ibatis.annotations.Mapper;
   import org.apache.ibatis.annotations.Select;
   import java.util.List;

   @Mapper
   public interface DeptMapper {

   		 @Select("select * from dept")
   		 public List<Dept> findAll();

   }
   ```

5. 改造之前编写的 dao、service 的代码，在 service 实现中注入 mapper 接口

   - dao 层的代码不需要了（备份之后，可以删除）

   - service 层的代码，需要注入 Mapper 接口，调用 mapper 接口方法查询数据库中的数据

     ```java
     @Service
     public class DeptServiceImpl implements DeptService {

     		 @Autowired
     		 private DeptMapper deptMapper;

     		 @Override
     		 public List<Dept> queryDeptList() {
     				 return deptMapper.findAll();
     		 }
     }
     ```

6. 启动服务，打开 apifox 进行测试

   ![image-20231130192402337](/assets/images/Java/JavaWeb/java代码操作数据库/image-20231130192402337.png)

   ![image-20231130192424671](/assets/images/Java/JavaWeb/java代码操作数据库/image-20231130192424671.png)

​

​ 经过测试，我们发现，创建时间 createTime，修改时间 updateTime 属性并未成功封装。 接下来，我们就需要来处理数据封装问题。

​

## 3.2 数据封装

我们看到查询返回的结果中大部分字段是有值的，但是 createTime，updateTime 这两个字段是没有值的，而数据库中是有对应的字段值的，这是为什么呢？

![image-20231130192556070](/assets/images/Java/JavaWeb/java代码操作数据库/image-20231130192556070.png)

原因如下：

- 实体类属性名和数据库表查询返回的字段名一致，mybatis 会自动封装。
- 如果实体类属性名和数据库表查询返回的字段名不一致，不能自动封装。

解决方案：

1. 起别名
2. 结果映射
3. 开启驼峰命名

**1. 起别名**：在 SQL 语句中，对不一样的列名起别名，别名和实体类属性名一样

```java
@Select("select id, name, create_time createTime, update_time updateTime from dept")
public List<Dept> findAll();
```

**2. 手动结果映射**：通过 @Results 及@Result 进行手动结果映射

```java
@Results({@Result(column = "create_time", property = "createTime"),
					@Result(column = "update_time", property = "updateTime")})
@Select("select id, name, create_time, update_time from dept")
public List<Dept> findAll();
```

> `@Results`源代码：
>
> ```java
> @Documented
> @Retention(RetentionPolicy.RUNTIME)
> @Target({ElementType.METHOD})
> public @interface Results {
> 	String id() default "";
> 	Result[] value() default {};  //Result类型的数组
> }
> ```
>
> `@Result`源代码：
>
> ```java
> @Documented
> @Retention(RetentionPolicy.RUNTIME)
> @Target({ElementType.METHOD})
> @Repeatable(Results.class)
> public @interface Result {
> 	boolean id() default false;//表示当前列是否为主键（true:是主键）
> 	String column() default "";//指定表中字段名
> 	String property() default "";//指定类中属性名
> }
> ```

**3. 开启驼峰命名(推荐)**：如果字段名与属性名符合驼峰命名规则，mybatis 会自动通过驼峰命名规则映射

> 驼峰命名规则： abc_xyz => abcXyz
>
> - 表中字段名：abc_xyz
> - 类中属性名：abcXyz

```properties
# 在application.properties中添加：
mybatis.configuration.map-underscore-to-camel-case=true
```

> 要使用驼峰命名前提是 实体类的属性 与 数据库表中的字段名严格遵守驼峰命名。
