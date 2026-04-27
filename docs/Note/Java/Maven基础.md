# Maven

## 课程内容

> 1. 初识 Maven
> 2. Maven 概述
>    - Maven 模型介绍
>    - Maven 仓库介绍
>    - Maven 安装与配置
> 3. IDEA 集成 Maven
> 4. 依赖管理
> 5. 单元测试

## 1. Maven 初识

### 1.1 什么是 Maven?

<img src="/assets/images/Java/JavaWeb/Maven基础/image-20231121170658821.png" alt="image-20231121170658821" style="zoom:50%;" />

Maven 是一款用于管理和构建 Java 项目的工具，是 Apache 旗下的一个开源项目 。

> Apache 软件基金会，成立于 1999 年 7 月，是目前世界上最大的最受欢迎的开源软件基金会，也是一个专门为支持开源项目而生的非盈利性组织。
>
> 开源项目：[https://www.apache.org/index.html#projects-list](https://www.apache.org/index.html)

那我们之前在 JavaSE 阶段，没有使用 Maven，依然可以构建 Java 项目。 我们为什么现在还要学习 Maven 呢 ? 那接下来，我们就来聊聊 Maven 的作用。

### 1.2 Maven 的作用

<img src="/assets/images/Java/JavaWeb/Maven基础/image-20231121171743838.png" alt="image-20231121171743838" style="zoom:67%;" />

#### 1.2.1 依赖管理

方便快捷的管理项目依赖的资源(jar 包)，避免版本冲突问题。

**1). 使用 maven 前**

我们项目中要想使用某一个 jar 包，就需要把这个 jar 包从官方网站下载下来，然后再导入到项目中。然后在这个项目中，就可以使用这个 jar 包了。

<img src="/assets/images/Java/JavaWeb/Maven基础/image-20231121172020180.png" alt="image-20231121172020180" style="zoom:80%;" />

**2). 使用 maven 后**

当使用 maven 进行项目依赖(jar 包)管理，则很方便的可以解决这个问题。 我们只需要在 maven 项目的 pom.xml 文件中，添加一段如下图所示的配置即可实现。

<img src="/assets/images/Java/JavaWeb/Maven基础/image-20231121172109208.png" alt="image-20231121172109208" style="zoom:67%;" />

在 maven 项目的配置文件中，加入上面这么一段配置信息之后，maven 会自动的根据配置信息的描述，去下载对应的依赖。 然后在项目中，就可以直接使用了。

#### 1.2.2 项目构建

Maven 还提供了标准化的跨平台的自动化构建方式。

<img src="/assets/images/Java/JavaWeb/Maven基础/image-20231121172608442.png" alt="image-20231121172608442" style="zoom:67%;" />

如上图所示我们开发了一套系统，代码需要进行编译、测试、打包、发布等过程，这些操作是所有项目中都需要做的，如果需要反复进行就显得特别麻烦，而 Maven 提供了一套简单的命令来完成项目构建。

<img src="/assets/images/Java/JavaWeb/Maven基础/image-20231121172650109.png" alt="image-20231121172650109" style="zoom:67%;" />

通过 Maven 中的命令，就可以很方便的完成项目的编译(compile)、测试(test)、打包(package)、发布(deploy) 等操作。

而且这些操作都是跨平台的，也就是说无论你是 Windows 系统，还是 Linux 系统，还是 Mac 系统，这些命令都是支持的。

#### 1.2.3 统一项目结构

Maven 还提供了标准、统一的项目结构 。

**1). 未使用 Maven**

由于 java 的开发工具呢，有很多，除了大家熟悉的 IDEA 以外，还有像早期的 Eclipse、MyEclipse。而不同的开发工具，创建出来的 java 项目的目录结构是存在差异的，那这就会出现一个问题。

Eclipse 创建的 java 项目，并不能直接导入 IDEA 中。 IDEA 创建的 java 项目，也没有办法直接导入到 Eclipse 中。

<img src="/assets/images/Java/JavaWeb/Maven基础/image-20231121174517472.png" alt="image-20231121174517472" style="zoom:67%;" />

**2). 使用 Maven**

而如果我们使用了 Maven 这一款项目构建工具，它给我们提供了一套标准的 java 项目目录。如下所示：

<img src="/assets/images/Java/JavaWeb/Maven基础/image-20231121174620227.png" alt="image-20231121174620227" style="zoom:67%;" />

也就意味着，无论我们使用的是什么开发工具，只要是基于 maven 构建的 java 项目，最终的目录结构都是相同的，如图所示。 那这样呢，我们使用 Eclipse、MyEclipse、IDEA 创建的 maven 项目，就可以在各个开发工具直接直接导入使用了，更加方便、快捷。

<img src="/assets/images/Java/JavaWeb/Maven基础/image-20231121174854987.png" alt="image-20231121174854987" style="zoom: 50%;" />

而在上面的 maven 项目的目录结构中，main 目录下存放的是项目的源代码，test 目录下存放的是项目的测试代码。 而无论是在 main 还是在 test 下，都有两个目录，一个是 java，用来存放源代码文件；另一个是 resources，用来存放配置文件。

最后呢，一句话总结一下什么是 Maven。 **Maven 就是一款管理和构建 java 项目的工具。**

Maven 的内容，我们进行了分层的设计和讲解，分为两个部分：Maven 核心和 Maven 进阶。 那今天，我们先来讲解 Maven 核心部分的内容，在 Web 开发的最后，我们再来讲解 Maven 进阶部分的内容。

## 2. Maven 概述

### 2.1 Maven 介绍

Apache Maven 是一个项目管理和构建工具，它基于项目对象模型(Project Object Model , 简称: POM)的概念，通过一小段描述信息来管理项目的构建、报告和文档。

官网：https://maven.apache.org/

Maven 的作用：

1. 方便的依赖管理
2. 统一的项目结构
3. 标准的项目构建流程

### 2.2 Maven 模型

- 项目对象模型 (Project Object Model)
- 依赖管理模型(Dependency)
- 构建生命周期/阶段(Build lifecycle & phases)

  1). 构建生命周期/阶段(Build lifecycle & phases)

![image-20221130142100703](/assets/images/Java/JavaWeb/Maven基础/image-20221130142100703.png)

以上图中紫色框起来的部分，就是用来完成标准化构建流程 。当我们需要编译，Maven 提供了一个编译插件供我们使用；当我们需要打包，Maven 就提供了一个打包插件供我们使用等。

2). 项目对象模型 (Project Object Model)

![image-20221130142643255](/assets/images/Java/JavaWeb/Maven基础/image-20221130142643255.png)

以上图中紫色框起来的部分属于项目对象模型，就是将我们自己的项目抽象成一个对象模型，有自己专属的坐标，如下图所示是一个 Maven 项目：

![image-20220616094113852](/assets/images/Java/JavaWeb/Maven基础/image-20220616094113852.png)

> 坐标，就是资源(jar 包)的唯一标识，通过坐标可以定位到所需资源(jar 包)位置
>
> ![image-20221130230134757](/assets/images/Java/JavaWeb/Maven基础/image-20221130230134757.png)

3). 依赖管理模型(Dependency)

![image-20221130143139644](/assets/images/Java/JavaWeb/Maven基础/image-20221130143139644.png)

以上图中紫色框起来的部分属于依赖管理模型，是使用坐标来描述当前项目依赖哪些第三方 jar 包

![image-20221130174805973](/assets/images/Java/JavaWeb/Maven基础/image-20221130174805973.png)

之前我们项目中需要 jar 包时，直接就把 jar 包复制到项目下的 lib 目录，而现在书写在 pom.xml 文件中的坐标又是怎么能找到所要的 jar 包文件的呢？

> 答案：Maven 仓库

### 2.3 Maven 仓库

仓库：用于存储资源，管理各种 jar 包

> 仓库的本质就是一个目录(文件夹)，这个目录被用来存储开发中所有依赖(就是 jar 包)和插件

Maven 仓库分为：

- 本地仓库：自己计算机上的一个目录(用来存储 jar 包)
- 中央仓库：由 Maven 团队维护的全球唯一的。仓库地址：https://repo1.maven.org/maven2/
- 远程仓库(私服)：一般由公司团队搭建的私有仓库

![image-20220616095633552](/assets/images/Java/JavaWeb/Maven基础/image-20220616095633552.png)

当项目中使用坐标引入对应依赖 jar 包后，首先会查找本地仓库中是否有对应的 jar 包

- 如果有，则在项目直接引用

- 如果没有，则去中央仓库中下载对应的 jar 包到本地仓库

如果还可以搭建远程仓库(私服)，将来 jar 包的查找顺序则变为： 本地仓库 --> 远程仓库--> 中央仓库

### 2.4 Maven 安装

认识了 Maven 后，我们就要开始使用 Maven 了，那么首先我们要进行 Maven 的下载与安装。

#### 2.4.1 下载

下载地址：https://maven.apache.org/download.cgi

在提供的资料中，已经提供了下载好的安装包。如下：

![image-20231121175618025](/assets/images/Java/JavaWeb/Maven基础/image-20231121175618025.png)

#### 2.4.2 安装步骤

Maven 安装配置步骤：

1. 解压安装
2. 配置仓库
3. 配置阿里云私服
4. 配置 Maven 环境变量

**1). 解压 apache-maven-3.9.4-bin.zip（解压即安装）**

> 建议解压到没有中文、特殊字符的路径下。如课程中解压到 `E:\develop` 下。

解压缩后的目录结构如下：

<img src="/assets/images/Java/JavaWeb/Maven基础/image-20231121175809075.png" alt="image-20231121175809075" style="zoom:80%;" />

- bin 目录 ： 存放的是可执行命令。（mvn 命令重点关注）
- conf 目录 ：存放 Maven 的配置文件。（settings.xml 配置文件后期需要修改）
- lib 目录 ：存放 Maven 依赖的 jar 包。（Maven 也是使用 java 开发的，所以它也依赖其他的 jar 包）

**2). 配置本地仓库**

2.1)、在自己计算机上新一个目录（本地仓库，用来存储 jar 包）

 <img src="/assets/images/Java/JavaWeb/Maven基础/image-20231121180010471.png" alt="image-20231121180010471" style="zoom:67%;" />

2.2)、进入到 conf 目录下修改 settings.xml 配置文件

1). 使用超级记事本软件，打开 settings.xml 文件，定位到 53 行

2). 复制`<localRepository>`标签，粘贴到注释的外面（55 行）

3). 复制之前新建的用来存储 jar 包的路径，替换掉`<localRepository>`标签体内容

<img src="/assets/images/Java/JavaWeb/Maven基础/image-20231121180147956.png" alt="image-20231121180147956" style="zoom: 67%;" />

**3). 配置阿里云私服**

由于中央仓库在国外，所以下载 jar 包速度可能比较慢，而阿里公司提供了一个远程仓库，里面基本也都有开源项目的 jar 包。

进入到 conf 目录下修改 settings.xml 配置文件：

1). 使用超级记事本软件，打开 settings.xml 文件，定位到 160 行左右

2). 在`<mirrors>`标签下为其添加子标签`<mirror>`，内容如下：

```xml
<mirror>
		<id>alimaven</id>
		<name>aliyun maven</name>
		<url>http://maven.aliyun.com/nexus/content/groups/public/</url>
		<mirrorOf>central</mirrorOf>
</mirror>
```

注意配置的位置，在`<mirrors> ... </mirrors> `中间添加配置。如下图所示：

<img src="/assets/images/Java/JavaWeb/Maven基础/image-20231121180412254.png" alt="image-20231121180412254" style="zoom:80%;" />

**4). 配置 maven 项目的 JDK 版本。**

需要在 `settings.xml` 中配置 JDK 的版本为 21 。

注意配置的位置，在`<profiles> ... </profiles> `中间添加配置。如下图所示：

```xml
	<profile>
		<id>jdk-21</id>
		<activation>
			<activeByDefault>true</activeByDefault>
			<jdk>21</jdk>
		</activation>
		<properties>
			<maven.compiler.source>21</maven.compiler.source>
			<maven.compiler.target>21</maven.compiler.target>
			<maven.compiler.compilerVersion>21</maven.compiler.compilerVersion>
		</properties>
	</profile>
```

**5). 配置环境变量**

> Maven 环境变量的配置类似于 JDK 环境变量配置一样

1). 在系统变量处新建一个变量 MAVEN_HOME

- MAVEN_HOME 环境变量的值，设置为 maven 的解压安装目录

​ <img src="/assets/images/Java/JavaWeb/Maven基础/image-20231121180537321.png" alt="image-20231121180537321" style="zoom:67%;" />

2). 在 Path 中进行配置

- PATH 环境变量的值，设置为：%MAVEN_HOME%\bin

​ <img src="/assets/images/Java/JavaWeb/Maven基础/image-20220616102435856.png" style="zoom:80%;" />

3). 打开 DOS 命令提示符进行验证，出现如图所示表示安装成功

```
mvn -v
```

![image-20231121180620210](/assets/images/Java/JavaWeb/Maven基础/image-20231121180620210.png)

## 3. IDEA 集成 Maven

我们要想在 IDEA 中使用 Maven 进行项目构建，就需要在 IDEA 中集成 Maven

### 3.1 配置 Maven 环境

#### 3.1.2 全局设置

1、进入到 IDEA 欢迎页面

- 选择 IDEA 中 File => close project

​ <img src="/assets/images/Java/JavaWeb/Maven基础/4.gif" style="zoom:80%;" />

​ <img src="/assets/images/Java/JavaWeb/Maven基础/image-20220616104338612.png" style="zoom:80%;" />

2、打开 All settings , 选择 Build,Execution,Deployment => Build Tools => Maven

​ <img src="/assets/images/Java/JavaWeb/Maven基础/image-20231121181406774.png" alt="image-20231121181406774" style="zoom:67%;" />

3、配置工程的编译版本为 20

​ <img src="/assets/images/Java/JavaWeb/Maven基础/image-20231121181515494.png" alt="image-20231121181515494" style="zoom:67%;" />

这里所设置的 maven 的环境信息，并未指定任何一个 project，此时设置的信息就属于全局配置信息。 以后，我们再创建 project，默认就是使用我们全局配置的信息。

### 3.2 Maven 项目

#### 3.2.1 创建 Maven 项目

1、创建一个空项目

<img src="/assets/images/Java/JavaWeb/Maven基础/image-20231121181649325.png" alt="image-20231121181649325" style="zoom:67%;" />

2、创建模块，选择 Java 语言，选择 Maven。 填写模块的基本信息

<img src="/assets/images/Java/JavaWeb/Maven基础/image-20231121181934260.png" alt="image-20231121181934260" style="zoom:67%;" />

4、在 Maven 工程下，创建 HelloWorld 类

![image-20231121182141986](/assets/images/Java/JavaWeb/Maven基础/image-20231121182141986.png)

> - Maven 项目的目录结构:
>
>   maven-project01
>   |--- src (源代码目录和测试代码目录)
>   |--- main (源代码目录)
>   |--- java (源代码 java 文件目录)
>   |--- resources (源代码配置文件目录)
>   |--- test (测试代码目录)
>   |--- java (测试代码 java 目录)
>   |--- resources (测试代码配置文件目录)
>   |--- target (编译、打包生成文件存放目录)

5、编写 HelloWorld，并运行

```java
public class HelloWorld {
		public static void main(String[] args) {
				System.out.println("Hello Maven ...");
		}
}
```

#### 3.2.2 POM 配置详解

POM (Project Object Model) ：指的是项目对象模型，用来描述当前的 maven 项目。

- 使用 pom.xml 文件来实现

pom.xml 文件：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
				 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
				 xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
		<!-- POM模型版本 -->
		<modelVersion>4.0.0</modelVersion>

		<!-- 当前项目坐标 -->
		<groupId>com.itheima</groupId>
		<artifactId>maven_project1</artifactId>
		<version>1.0-SNAPSHOT</version>

		<!-- 打包方式 -->
		<packaging>jar</packaging>

</project>
```

pom 文件详解：

- `<project> `：pom 文件的根标签，表示当前 maven 项目
- `<modelVersion> `：声明项目描述遵循哪一个 POM 模型版本
  - 虽然模型本身的版本很少改变，但它仍然是必不可少的。目前 POM 模型版本是 4.0.0
- 坐标 ：`<groupId>`、`<artifactId>`、`<version>`
  - 定位项目在本地仓库中的位置，由以上三个标签组成一个坐标
- `<packaging>` ：maven 项目的打包方式，通常设置为 jar 或 war（默认值：jar）

#### 3.2.3 Maven 坐标详解

什么是坐标？

- Maven 中的坐标是==资源的唯一标识== , 通过该坐标可以唯一定位资源位置
- 使用坐标来定义项目或引入项目中需要的依赖

Maven 坐标主要组成

- groupId：定义当前 Maven 项目隶属组织名称（通常是域名反写，例如：com.itheima）
- artifactId：定义当前 Maven 项目名称（通常是模块名称，例如 order-service、goods-service）
- version：定义当前项目版本号
  - SNAPSHOT: 功能不稳定、尚处于开发中的版本，即快照版本
  - RELEASE: 功能趋于稳定、当前更新停止，可以用于发行的版本

如下图就是使用坐标表示一个项目：

<img src="/assets/images/Java/JavaWeb/Maven基础/image-20231121182259109.png" alt="image-20231121182259109" style="zoom: 80%;" />

> **注意：**
>
> - 上面所说的资源可以是插件、依赖、当前项目。
> - 我们的项目如果被其他的项目依赖时，也是需要坐标来引入的。

### 3.3 导入 Maven 项目

**方式 1**

打开 IDEA，选择 File -> Project Structure -> Modules -> Import Module -> 选择 maven 项目的 pom.xml

<img src="/assets/images/Java/JavaWeb/Maven基础/image-20231121182520581.png" alt="image-20231121182520581" style="zoom:80%;" />

> 说明：如果没有 Maven 面板，选择 View => Appearance => Tool Window Bars
>
> ![image-20220616111937679](/assets/images/Java/JavaWeb/Maven基础/image-20220616111937679.png)

- **方式 2**

Maven 面板 -> +（Add Maven Projects） -> 选择 maven 项目的 pom.xml

<img src="/assets/images/Java/JavaWeb/Maven基础/image-20231121182615482.png" alt="image-20231121182615482" style="zoom:80%;" />

## 4. 依赖管理

### 4.1 依赖配置

依赖：指当前项目运行所需要的 jar 包。一个项目中可以引入多个依赖：

例如：在当前工程中，我们需要用到 logback 来记录日志，此时就可以在 maven 工程的 pom.xml 文件中，引入 logback 的依赖。具体步骤如下：

1. 在 pom.xml 中编写`<dependencies>`标签

2. 在`<dependencies>`标签中使用`<dependency>`引入坐标

3. 定义坐标的 groupId、artifactId、version

```xml
<dependencies>
		<!-- 依赖 : commons-io -->
		<dependency>
				<groupId>commons-io</groupId>
				<artifactId>commons-io</artifactId>
				<version>2.11.0</version>
		</dependency>
</dependencies>
```

4. 点击刷新按钮，引入最新加入的坐标

   刷新依赖：保证每一次引入新的依赖，或者修改现有的依赖配置，都可以加入最新的坐标

​ <img src="/assets/images/Java/JavaWeb/Maven基础/image-20231121182814533.png" alt="image-20231121182814533" style="zoom:80%;" />

> 注意事项：
>
> 1. 如果引入的依赖，在本地仓库中不存在，将会连接远程仓库 / 中央仓库，然后下载依赖（这个过程会比较耗时，耐心等待）
> 2. 如果不知道依赖的坐标信息，可以到 mvn 的中央仓库（https://mvnrepository.com/）中搜索

**添加依赖的几种方式：**

1. 利用中央仓库搜索的依赖坐标

 <img src="/assets/images/Java/JavaWeb/Maven基础/5.gif" style="zoom: 67%;" />

2. 利用 IDEA 工具搜索依赖

 <img src="/assets/images/Java/JavaWeb/Maven基础/6.gif" style="zoom: 67%;" />

3. 熟练上手 maven 后，快速导入依赖

 <img src="/assets/images/Java/JavaWeb/Maven基础/7.gif" style="zoom: 67%;" />

### 4.2 依赖传递

#### 4.2.1 依赖具有传递性

早期我们没有使用 maven 时，向项目中添加依赖的 jar 包，需要把所有的 jar 包都复制到项目工程下。如下图所示，需要 logback-classic 时，由于 logback-classic 又依赖了 logback-core 和 slf4j，所以必须把这 3 个 jar 包全部复制到项目工程下

![image-20221201120514644](/assets/images/Java/JavaWeb/Maven基础/image-20221201120514644.png)

我们现在使用了 maven，当项目中需要使用 logback-classic 时，只需要在 pom.xml 配置文件中，添加 logback-classic 的依赖坐标即可。

![image-20221201113659400](/assets/images/Java/JavaWeb/Maven基础/image-20221201113659400.png)

在 pom.xml 文件中只添加了 logback-classic 依赖，但由于 maven 的依赖具有传递性，所以会自动把所依赖的其他 jar 包也一起导入。

依赖传递可以分为：

1. 直接依赖：在当前项目中通过依赖配置建立的依赖关系

2. 间接依赖：被依赖的资源如果依赖其他资源，当前项目间接依赖其他资源

​ <img src="/assets/images/Java/JavaWeb/Maven基础/image-20231121183842374.png" alt="image-20231121183842374" style="zoom:80%;" />

​

比如以上图中：

- projectA 依赖了 projectB。对于 projectA 来说，projectB 就是直接依赖 。
- 而 projectB 依赖了 projectC 及其他 jar 包。 那么此时，在 projectA 中也会将 projectC 的依赖传递下来 。对于 projectA 来说，projectC 就是间接依赖。

![image-20221201115801806](/assets/images/Java/JavaWeb/Maven基础/image-20221201115801806.png)

#### 4.2.2 排除依赖

问题：之前我们讲了依赖具有传递性。那么 A 依赖 B，B 依赖 C，如果 A 不想将 C 依赖进来，是否可以做到？

答案：在 maven 项目中，我们可以通过排除依赖来实现。

什么是排除依赖？

- 排除依赖：指主动断开依赖的资源。（被排除的资源无需指定版本）

```xml
<dependency>
		<groupId>com.itheima</groupId>
		<artifactId>maven-projectB</artifactId>
		<version>1.0-SNAPSHOT</version>

		<!--排除依赖, 主动断开依赖的资源-->
		<exclusions>
			<exclusion>
						<groupId>junit</groupId>
						<artifactId>junit</artifactId>
				</exclusion>
		</exclusions>
</dependency>
```

依赖排除示例：

- maven-projectA 依赖了 maven-projectB，maven-projectB 依赖了 Junit。基于依赖的传递性，所以 maven-projectA 也依赖了 Junit

![image-20221201141929240](/assets/images/Java/JavaWeb/Maven基础/image-20221201141929240.png)

- 使用排除依赖后

![image-20221201142501556](/assets/images/Java/JavaWeb/Maven基础/image-20221201142501556.png)

### 4.3 生命周期

#### 4.3.1 介绍

Maven 的生命周期就是为了对所有的构建过程进行抽象和统一。 描述了一次项目构建，经历哪些阶段。

在 Maven 出现之前，项目构建的生命周期就已经存在，软件开发人员每天都在对项目进行清理，编译，测试及部署。虽然大家都在不停地做构建工作，但公司和公司间、项目和项目间，往往使用不同的方式做类似的工作。

Maven 从大量项目和构建工具中学习和反思，然后总结了一套高度完美的，易扩展的项目构建生命周期。这个生命周期包含了项目的清理，初始化，编译，测试，打包，集成测试，验证，部署和站点生成等几乎所有构建步骤。

Maven 对项目构建的生命周期划分为 3 套（相互独立）：

 <img src="/assets/images/Java/JavaWeb/Maven基础/image-20220616124015567.png" style="zoom:80%;" />

- clean：清理工作。

- default：核心工作。如：编译、测试、打包、安装、部署等。

- site：生成报告、发布站点等。

三套生命周期又包含哪些具体的阶段呢, 我们来看下面这幅图:

<img src="/assets/images/Java/JavaWeb/Maven基础/image-20220616124348972.png" alt="image-20220616124348972" style="zoom:80%;" />

我们看到这三套生命周期，里面有很多很多的阶段，这么多生命周期阶段，其实我们常用的并不多，主要关注以下几个：

• clean：移除上一次构建生成的文件

• compile：编译项目源代码

• test：使用合适的单元测试框架运行测试(junit)

• package：将编译后的文件打包，如：jar、war 等

• install：安装项目到本地仓库

Maven 的生命周期是抽象的，这意味着生命周期本身不做任何实际工作。**在 Maven 的设计中，实际任务（如源代码编译）都交由插件来完成。**

<img src="/assets/images/Java/JavaWeb/Maven基础/image-20221130142100703.png" alt="image-20221130142100703" style="zoom:80%;" />

IDEA 工具为了方便程序员使用 maven 生命周期，在右侧的 maven 工具栏中，已给出快速访问通道

![image-20221201151340340](/assets/images/Java/JavaWeb/Maven基础/image-20221201151340340.png)

生命周期的顺序是：clean --> validate --> compile --> test --> package --> verify --> install --> site --> deploy

我们需要关注的就是：clean --> compile --> test --> package --> install

> 说明：在同一套生命周期中，我们在执行后面的生命周期时，前面的生命周期都会执行。

> 思考：当运行 package 生命周期时，clean、compile 生命周期会不会运行？
>
> ​ clean 不会运行，compile 会运行。 因为 compile 与 package 属于同一套生命周期，而 clean 与 package 不属于同一套生命周期。

#### 4.3.2 执行

在日常开发中，当我们要执行指定的生命周期时，有两种执行方式：

1. 在 idea 工具右侧的 maven 工具栏中，选择对应的生命周期，双击执行
2. 在 DOS 命令行中，通过 maven 命令执行

**方式一：在 idea 中执行生命周期**

- 选择对应的生命周期，双击执行

<img src="/assets/images/Java/JavaWeb/Maven基础/image-20221201161957301.png" alt="image-20221201161957301" style="zoom:60%;" />

compile：

<img src="/assets/images/Java/JavaWeb/Maven基础/image-20221201163711835.png" alt="image-20221201163711835" style="zoom:60%;" />

test：

<img src="/assets/images/Java/JavaWeb/Maven基础/image-20221201164627403.png" alt="image-20221201164627403" style="zoom:60%;" />

package：

<img src="/assets/images/Java/JavaWeb/Maven基础/image-20221201165801341.png" alt="image-20221201165801341" style="zoom: 60%;" />

... ...

**方式二：在命令行中执行生命周期**

1. 进入到 DOS 命令行

<img src="/assets/images/Java/JavaWeb/Maven基础/image-20221201172210253.png" alt="image-20221201172210253" style="zoom:80%;" />

<img src="/assets/images/Java/JavaWeb/Maven基础/image-20221201172914648.png" alt="image-20221201172914648" style="zoom:80%;" />

## 5. 单元测试

### 5.1 介绍

- **测试：** 是一种用来促进鉴定软件的正确性、完整性、安全性和质量的过程。

- **阶段划分：** 单元测试、集成测试、系统测试、验收测试。

<img src="/assets/images/Java/JavaWeb/Maven基础/image-20231121205358842.png" alt="image-20231121205358842" style="zoom: 67%;" />

**1). 单元测试**

介绍：对软件的基本组成单位进行测试，最小测试单位。

目的：检验软件基本组成单位的正确性。

测试人员：开发人员

**2). 集成测试**

介绍：将已分别通过测试的单元，按设计要求组合成系统或子系统，再进行的测试。

目的：检查单元之间的协作是否正确。

测试人员：开发人员

**3). 系统测试**

介绍：对已经集成好的软件系统进行彻底的测试。

目的：验证软件系统的正确性、性能是否满足指定的要求。

测试人员：测试人员

**4). 验收测试**

介绍：交付测试，是针对用户需求、业务流程进行的正式的测试。

目的：验证软件系统是否满足验收标准。

测试人员：客户/需求方

- **测试方法：** 白盒测试、黑盒测试 及 灰盒测试。

<img src="/assets/images/Java/JavaWeb/Maven基础/image-20231121210849299.png" alt="image-20231121210849299" style="zoom:67%;" />

**1). 白盒测试**

清楚软件内部结构、代码逻辑。

用于验证代码、逻辑正确性。

**2). 黑盒测试**

不清楚软件内部结构、代码逻辑。

用于验证软件的功能、兼容性、验收测试等方面。

**3). 灰盒测试**

结合了白盒测试和黑盒测试的特点，既关注软件的内部结构又考虑外部表现（功能）。

<img src="/assets/images/Java/JavaWeb/Maven基础/image-20231121211350133.png" alt="image-20231121211350133" style="zoom:80%;" />

### 5.2 Junit 快速入门

#### 5.2.1 单元测试

- 单元测试：就是针对最小的功能单元(方法)，编写测试代码对其正确性进行测试。

- JUnit：最流行的 Java 测试框架之一，提供了一些功能，方便程序进行单元测试（第三方公司提供）。

在之前的课程中，我们进行程序的测试 ，都是 main 方法中进行测试 。如下图所示：

<img src="/assets/images/Java/JavaWeb/Maven基础/image-20231121212344174.png" alt="image-20231121212344174" style="zoom: 67%;" />

通过 main 方法是可以进行测试的，可以测试程序是否正常运行。但是 main 方法进行测试时，会存在如下问题：

1. 测试代码与源代码未分开，难维护。
2. 一个方法测试失败，影响后面方法。
3. 无法自动化测试，得到测试报告。

而如果我们使用了 JUnit 单元测试框架进行测试，将会有以下优势：

1. 测试代码与源代码分开，便于维护。
2. 可根据需要进行自动化测试。
3. 可自动分析测试结果，产出测试报告。

​ <img src="/assets/images/Java/JavaWeb/Maven基础/image-20231121213030314.png" alt="image-20231121213030314" style="zoom:80%;" />

​

​

#### 5.2.2 入门程序

需求：使用 JUnit，对 UserService 中的业务方法进行单元测试，测试其正确性。

1. 在`pom.xml`中，引入 JUnit 的依赖。

   ```xml
   <!--Junit单元测试依赖-->
   <dependency>
   		 <groupId>org.junit.jupiter</groupId>
   		 <artifactId>junit-jupiter</artifactId>
   		 <version>5.9.1</version>
   		 <scope>test</scope>
   </dependency>
   ```

2. 在 test/java 目录下，创建测试类，并编写对应的测试方法，并在方法上声明@Test 注解。

   ```java
   @Test
   public void testGetAge(){
   		 Integer age = new UserService().getAge("110002200505091218");
   		 System.out.println(age);
   }
   ```

3. 运行单元测试 (测试通过：绿色；测试失败：红色)。

   测试通过显示<font color='gree'>绿色</font>

​ <img src="/assets/images/Java/JavaWeb/Maven基础/image-20231121213825685.png" alt="image-20231121213825685" style="zoom:80%;" />

​ 测试失败显示<font color='red'>红色</font>

​ <img src="/assets/images/Java/JavaWeb/Maven基础/image-20231121214044713.png" alt="image-20231121214044713" style="zoom:67%;" />

​

> 注意：
>
>     1. 测试类的命名规范为：XxxxTest
>     1. 测试方法的命名规范为：public void xxx(){...}

### 5.3 常见注解

在 JUnit 中还提供了一些注解，还增强其功能，常见的注解有以下几个：

| **注解**           | **说明**                                                         | **备注**                         |
| ------------------ | ---------------------------------------------------------------- | -------------------------------- |
| @Test              | 测试类中的方法用它修饰才能成为测试方法，才能启动执行             | 单元测试                         |
| @BeforeEach        | 用来修饰一个实例方法，该方法会在每一个测试方法执行之前执行一次。 | 初始化资源(准备工作)             |
| @AfterEach         | 用来修饰一个实例方法，该方法会在每一个测试方法执行之后执行一次。 | 释放资源(清理工作)               |
| @BeforeAll         | 用来修饰一个静态方法，该方法会在所有测试方法之前只执行一次。     | 初始化资源(准备工作)             |
| @AfterAll          | 用来修饰一个静态方法，该方法会在所有测试方法之后只执行一次。     | 释放资源(清理工作)               |
| @ParameterizedTest | 参数化测试的注解 (可以让单个测试运行多次，每次运行时仅参数不同)  | 用了该注解，就不需要@Test 注解了 |
| @ValueSource       | 参数化测试的参数来源，赋予测试方法参数                           | 与参数化测试注解配合使用         |
| @DisplayName       | 指定测试类、测试方法显示的名称 （默认为类名、方法名）            |                                  |

演示 `@BeforeEach`，`@AfterEach`，`@BeforeAll`，`@AfterAll` 注解：

```java
public class UserServiceTest {

		@BeforeEach
		public void testBefore(){
				System.out.println("before...");
		}

		@AfterEach
		public void testAfter(){
				System.out.println("after...");
		}

		@BeforeAll //该方法必须被static修饰
		public static void testBeforeAll(){
				System.out.println("before all ...");
		}

		@AfterAll //该方法必须被static修饰
		public static void testAfterAll(){
				System.out.println("after all...");
		}

		@Test
		public void testGetAge(){
				Integer age = new UserService().getAge("110002200505091218");
				System.out.println(age);
		}

		@Test
		public void testGetGender(){
				String gender = new UserService().getGender("612429198904201611");
				System.out.println(gender);
		}
 }
```

输出结果如下：

![image-20231122100220525](/assets/images/Java/JavaWeb/Maven基础/image-20231122100220525.png)

演示 `@ParameterizedTest  `，`@ValueSource` ，`@DisplayName` 注解：

```java
package com.itheima;

import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

@DisplayName("测试-学生业务操作")
public class UserServiceTest {

		@DisplayName("测试-获取年龄")
		@Test
		public void testGetAge(){
				Integer age = new UserService().getAge("110002200505091218");
				System.out.println(age);
		}

		@DisplayName("测试-获取性别")
		@Test
		public void testGetGender(){
				String gender = new UserService().getGender("612429198904201611");
				System.out.println(gender);
		}

		@DisplayName("测试-获取性别3")
		@ParameterizedTest
		@ValueSource(strings = {"612429198904201611","612429198904201631","612429198904201626"})
		public void testGetGender3(String idcard){
				String gender = new UserService().getGender(idcard);
				 System.out.println(gender);
		}
}
```

输出结果如下：

![image-20231122100806285](/assets/images/Java/JavaWeb/Maven基础/image-20231122100806285.png)

### 5.4 断言

JUnit 提供了一些辅助方法，用来帮我们确定被测试的方法是否按照预期的效果正常工作，这种方式称为**断言**。

| **断言方法**                                          | **描述**                                   |
| ----------------------------------------------------- | ------------------------------------------ |
| assertEquals(Object exp, Object act, String msg)      | 检查两个值是否相等，不相等就报错。         |
| assertNotEquals(Object unexp, Object act, String msg) | 检查两个值是否不相等，相等就报错。         |
| assertNull(Object act, String msg)                    | 检查对象是否为 null，不为 null，就报错。   |
| assertNotNull(Object act, String msg)                 | 检查对象是否不为 null，为 null，就报错。   |
| assertTrue(boolean condition, String msg)             | 检查条件是否为 true，不为 true，就报错。   |
| assertFalse(boolean condition, String msg)            | 检查条件是否为 false，不为 false，就报错。 |
| assertSame(Object exp, Object act, String msg)        | 检查两个对象引用是否相等，不相等，就报错。 |

示例演示：

```java
package com.itheima;

import org.junit.jupiter.api.*;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

@DisplayName("测试-学生业务操作")
public class UserServiceTest {
		@DisplayName("测试-获取年龄2")
		@Test
		public void testGetAge2(){
				Integer age = new UserService().getAge("110002200505091218");
				Assertions.assertNotEquals(18, age, "两个值相等");
//        String s1 = new String("Hello");
//        String s2 = "Hello";
//        Assertions.assertSame(s1, s2, "不是同一个对象引用");
		}

		@DisplayName("测试-获取性别2")
		@Test
		public void testGetGender2(){
				String gender = new UserService().getGender("612429198904201611");
				Assertions.assertEquals("男", gender);
		}

		@DisplayName("测试-获取性别3")
		@ParameterizedTest
		@ValueSource(strings = {"612429198904201611","612429198904201631","612429198904201626"})
		public void testGetGender3(String idcard){
				String gender = new UserService().getGender(idcard);
				Assertions.assertEquals("男", gender);
		}
}

```

测试结果输出：

![image-20231122101105549](/assets/images/Java/JavaWeb/Maven基础/image-20231122101105549.png)

### 5.5 依赖范围

依赖的 jar 包，默认情况下，可以在任何地方使用。

<img src="/assets/images/Java/JavaWeb/Maven基础/image-20231122101238601.png" alt="image-20231122101238601" style="zoom:80%;" />

在 maven 中，如果希望限制依赖的使用范围，可以通过 `<scope>…</scope>` 设置其作用范围。

<img src="/assets/images/Java/JavaWeb/Maven基础/image-20231121224153187.png" alt="image-20231121224153187" style="zoom:67%;" />

作用范围：

- 主程序范围有效。（main 文件夹范围内）

- 测试程序范围有效。（test 文件夹范围内）

- 是否参与打包运行。（package 指令范围内）

可以在 pom.xml 中配置 `<scope></scope>` 属性来控制依赖范围。

<img src="/assets/images/Java/JavaWeb/Maven基础/image-20231121224241781.png" alt="image-20231121224241781" style="zoom:80%;" />

如果对 Junit 单元测试的依赖，设置了 scope 为 test，就代表，该依赖，只是在测试程序中可以使用，在主程序中是无法使用的。所以我们会看到如下现象：

![image-20231122101613107](/assets/images/Java/JavaWeb/Maven基础/image-20231122101613107.png)

如上图所示，给 junit 依赖通过 scope 标签指定依赖的作用范围。 那么这个依赖就只能作用在测试环境，其他环境下不能使用。

scope 的取值常见的如下：

| **scope值** | **主程序** | **测试程序** | **打包（运行）** | **范例**    |
| ------------------- | ---------- | ------------ | ---------------- | ----------- |
| compile（默认）     | Y          | Y            | Y                | log4j       |
| test                | -          | Y            | -                | junit       |
| provided            | Y          | Y            | -                | servlet-api |
| runtime             | -          | Y            | Y                | jdbc 驱动   |

## 6. Maven 常见问题

<img src="/assets/images/Java/JavaWeb/Maven基础/image-20231122101744998.png" alt="image-20231122101744998" style="zoom:80%;" />

- 问题现象：Maven 项目中添加的依赖，未正确下载，造成右侧 Maven 面板中的依赖报红，再次 reload 重新加载也不会再下载。

- 产生原因：由于网络原因，依赖没有下载完整导致的，在 maven 仓库中生成了 xxx.lastUpdated 文件，该文件不删除，不会再重新下载。

​ ![image-20231122101913739](/assets/images/Java/JavaWeb/Maven基础/image-20231122101913739.png)

- 解决方案：
  - 根据 maven 依赖的坐标，找到仓库中对应的 xxx.lastUpdated 文件，删除，删除之后重新加载项目即可。
  - 通过命令 (del /s \*.lastUpdated) 批量递归删除指定目录下的 xxx.lastUpdated 文件，删除之后重新加载项目即可。
  - 重新加载依赖，依赖下载了之后，maven 面板可能还会报红，此时可以关闭 IDEA，重新打开 IDEA 加载此项目即可。
