# Linux-Day01

## 课程内容

- Linux简介
- Linux安装
- Linux常用命令

## 1. 前言

### 1.1 什么是Linux

![image-20210808232140228](/assets/images/Java/Linux/image-20210808232140228.png)

Linux是一套免费使用和自由传播的操作系统。说到操作系统，大家比较熟知的应该就是Windows和MacOS操作系统，我们今天所学习的Linux也是一款操作系统。

![image-20210808233951662](/assets/images/Java/Linux/image-20210808233951662.png)

我们作为javaEE开发工程师，将来在企业中开发时会涉及到很多的数据库、中间件等技术，比如MySQL、Redis、MQ等技术，而这些应用软件大多都是需要安装在Linux系统中使用的。我们做为开发人员，是需要通过远程工具连接Linux操作系统，然后来操作这些软件的。而且一些小公司，可能还需要我们自己在服务器上安装这些软件。

所以，不管从企业的用人需求层面，还是个人发展需要层面来讲，我们作为服务端开发工程师，Linux的基本使用是我们必不可少的技能。

**对于Linux的常用指令的学习，最好的学习方法就是：<font color='red' size=7>多敲</font>**

## 2. Linux简介

### 2.1 主流操作系统

不同领域的主流操作系统，主要分为以下这么几类： 桌面操作系统、服务器操作系统、移动设备操作系统、嵌入式操作系统。接下来，这几个领域中，代表性的操作系统是那些?

1). 桌面操作系统

| 操作系统 | 特点                                   |
| -------- | -------------------------------------- |
| Windows  | 用户数量最多                           |
| MacOS    | 操作体验好，办公人士首选               |
| Linux    | 用户数量少(桌面操作系统,Linux使用较少) |

2). 服务器操作系统

| 操作系统       | 特点                       |
| -------------- | -------------------------- |
| Unix           | 安全、稳定、付费           |
| Linux          | 安全、稳定、免费、占有率高 |
| Windows Server | 付费、占有率低             |

3). 移动设备操作系统

| 操作系统 | 特点                                                          |
| -------- | ------------------------------------------------------------- |
| Android  | 基于 Linux 、开源，主要用于智能手机、平板电脑和智能电视       |
| IOS      | 苹果公司开发、不开源，用于苹果公司的产品，例如：iPhone、 iPad |

4). 嵌入式操作系统

| 操作系统 | 特点                   |
| -------- | ---------------------- |
| Linux    | 机顶盒、路由器、交换机 |

### 2.2 Linux系统版本

Linux系统的版本分为两种，分别是： 内核版 和 发行版。

**1). 内核版**

- 由Linus Torvalds及其团队开发、维护

- 免费、开源

- 负责控制硬件

**2). 发行版**

- 基于Linux内核版进行扩展

- 由各个Linux厂商开发、维护

- 有收费版本和免费版本

我们使用Linux操作系统，实际上选择的是Linux的发行版本。在linux系统中，有各种各样的发行版本，具体如下：

| 发行版本  | Logo                                                                                             | 特点                             |
| --------- | ------------------------------------------------------------------------------------------------ | -------------------------------- |
| Ubuntu    | <img src="/assets/images/Java/Linux/image-20210809001838861.png" alt="image-20210809001838861" style="zoom:50%;" /> | 以桌面应用为主                   |
| RedHat    | <img src="/assets/images/Java/Linux/image-20210809001731378.png" alt="image-20210809001731378" style="zoom:50%;" /> | 应用最广泛、收费                 |
| CentOS    | <img src="/assets/images/Java/Linux/image-20210809001741238.png" alt="image-20210809001741238" style="zoom:50%;" /> | RedHat的社区版、免费             |
| openSUSE  | <img src="/assets/images/Java/Linux/image-20210809001750999.png" alt="image-20210809001750999" style="zoom:50%;" /> | 对个人完全免费、图形界面华丽     |
| Fedora    | <img src="/assets/images/Java/Linux/image-20210809001800676.png" alt="image-20210809001800676" style="zoom:50%;" /> | 功能完备、快速更新、免费         |
| 红旗Linux | <img src="/assets/images/Java/Linux/image-20210809001814942.png" alt="image-20210809001814942" style="zoom:50%;" /> | 北京中科红旗软件技术有限公司开发 |

除了上述罗列出来的发行版，还有很多Linux发行版，这里，我们就不再一一列举了。

### 2.3. Linux安装

#### 2.3.1 安装方式介绍

Linux系统的安装方式，主要包含以下两种：

![image-20210809184915617](/assets/images/Java/Linux/image-20210809184915617.png)

| 方式       | 概述                             | 场景                                                                      |
| ---------- | -------------------------------- | ------------------------------------------------------------------------- |
| 物理机安装 | 直接将操作系统安装到服务器硬件上 | 企业开发中，我们使用的服务器基本都是采用这种方式                          |
| 虚拟机安装 | 通过虚拟机软件安装               | 我们在学习阶段，没有自己服务器，而我们又需要学Linux，就可以安装在虚拟机上 |

**虚拟机**（Virtual Machine）指通过**软件**模拟的具有完整硬件系统功能、运行在完全隔离环境中的完整计算机系统。常用虚拟机软件：

- VMWare

- VirtualBox

- VMLite WorkStation

- Qemu

- HopeddotVOS

那么我们就可以在课程中将Linux操作系统安装在虚拟机中，我们课上选择的虚拟机软件是VMware。

#### 2.3.2 安装VMware

![image-20231213232506962](/assets/images/Java/Linux/image-20231213232506962.png)

在我们的课程资料中提供了VMware的安装程序。直接双击运行VMware安装程序，根据提示完成安装即可。

![image-20210809223932893](/assets/images/Java/Linux/image-20210809223932893.png)

![image-20210809223953820](/assets/images/Java/Linux/image-20210809223953820.png)

以上就是VMware在安装时的每一步操作，基本上就是点击 "下一步" 一直进行安装。

#### 2.3.3 挂载Linux系统

1). 解压 `资料/Linux镜像/CentOS7-1.zip ` 到一个比较大的磁盘中。

2). 双击 `.vmx` 文件，选择以 `Vmware Workstation` 打开这个文件。

<img src="/assets/images/Java/Linux/image-20231213232819432.png" alt="image-20231213232819432" style="zoom: 67%;" /> <img src="/assets/images/Java/Linux/image-20231213232915747.png" alt="image-20231213232915747" style="zoom:67%;" />

3). 挂载完毕之后，启动Linux服务器。

<img src="/assets/images/Java/Linux/image-20231213232952317.png" alt="image-20231213232952317" style="zoom:80%;" />

出现下面这个提示，选择"我已复制该虚拟机"

<img src="/assets/images/Java/Linux/001.png">

4). 启动完毕之后，登录服务器。 输入用户名：root，密码：1234 （**注意：linux系统输入密码是不显示的，输入完毕，回车即可登录**）

<img src="/assets/images/Java/Linux/image-20231213233314187.png" alt="image-20231213233314187" style="zoom:80%;" />

5). 输入命令 `ip addr` 查看服务器的IP地址

<img src="/assets/images/Java/Linux/image-20231213233406260.png" alt="image-20231213233406260" style="zoom:80%;" />

### 2.4 安装SSH连接工具

#### 2.4.1 SSH连接工具介绍

Linux已经安装并且配置好了，接下来我们要来学习Linux的基本操作指令。而在学习之前，我们还需要做一件事情，由于我们企业开发时，Linux服务器一般都是在远程的机房部署的，我们要操作服务器，不会每次都跑到远程的机房里面操作，而是会直接通过SSH连接工具进行连接操作。

![image-20210810000224690](/assets/images/Java/Linux/image-20210810000224690.png)

SSH（Secure Shell），建立在应用层基础上的安全协议。常用的SSH连接工具:

| SSH工具    | Logo                                                                                              | 说明                                    |
| ---------- | ------------------------------------------------------------------------------------------------- | --------------------------------------- |
| putty      | <img src="/assets/images/Java/Linux/image-20210809235613688.png" alt="image-20210809235613688" style="zoom:15%;" />  | 免费, 界面简单, 功能单一                |
| secureCRT  | <img src="/assets/images/Java/Linux/image-20210809235723109.png" alt="image-20210809235723109" style="zoom:20%;" />  | 收费, 功能强大                          |
| xshell     | <img src="/assets/images/Java/Linux/image-20210809235802640.png" alt="image-20210809235802640" style="zoom:50%;" />  | 收费版/免费版                           |
| finalshell | <img src="/assets/images/Java/Linux/image-20210809235841384.png" alt="image-20210809235841384" style="zoom: 67%;" /> | 免费, 功能强大, 界面效果好 (课程中采用) |

#### 3.5.2 FinalShell安装

在课程资料中，提供了finalShell的安装包

![image-20210810000309123](/assets/images/Java/Linux/image-20210810000309123.png)

双击.exe文件，然后进行正常的安装即可。

![image-20210810000318212](/assets/images/Java/Linux/image-20210810000318212.png)

#### 3.5.3 连接Linux

**1). 打开finalShell**

<img src="/assets/images/Java/Linux/image-20210810173004153.png" alt="image-20210810173004153" style="zoom:80%;" />

**2). 建立连接**

<img src="/assets/images/Java/Linux/image-20210810173138650.png" alt="image-20210810173138650" style="zoom:80%;" />

![image-20210810173900140](/assets/images/Java/Linux/image-20210810173900140.png)

### 2.5 Linux目录结构

登录到Linux系统之后，我们需要先来熟悉一下Linux的目录结构。在Linux系统中，也是存在目录的概念的，但是Linux的目录结构和Windows的目录结构是存在比较多的差异的 在Windows目录下，是一个一个的盘符(C盘、D盘、E盘)，目录是归属于某一个盘符的。Linux系统中的目录有以下特点：

**A. / 是所有目录的顶点**

**B. 目录结构像一颗倒挂的树**

**Linux 和 Windows的目录结构对比:**

<img src="/assets/images/Java/Linux/image-20210810174831655.png" alt="image-20210810174831655" style="zoom: 80%;" />

Linux的目录结构，如下：

![image-20210810174954476](/assets/images/Java/Linux/image-20210810174954476.png)

根目录/ 下各个目录的作用及含义说明:

| 编号 | 目录  | 含义                                       |
| ---- | ----- | ------------------------------------------ |
| 1    | /bin  | 存放二进制可执行文件                       |
| 2    | /boot | 存放系统引导时使用的各种文件               |
| 3    | /dev  | 存放设备文件                               |
| 4    | /etc  | 存放系统配置文件                           |
| 5    | /home | 存放系统用户的文件                         |
| 6    | /lib  | 存放程序运行所需的共享库和内核模块         |
| 7    | /opt  | 额外安装的可选应用程序包所放置的位置       |
| 8    | /root | 超级用户目录                               |
| 9    | /sbin | 存放二进制可执行文件，只有root用户才能访问 |
| 10   | /tmp  | 存放临时文件                               |
| 11   | /usr  | 存放系统应用程序                           |
| 12   | /var  | 存放运行时需要改变数据的文件，例如日志文件 |

## 3. Linux常用命令

### 3.1 Linux命令初体验

#### 3.1.1 常用命令演示

在这一部分中，我们主要介绍几个常用的命令，让大家快速感受以下Linux指令的操作方式。主要包含以下几个指令：

| 序号 | 命令           | 对应英文             | 作用                    |
| ---- | -------------- | -------------------- | ----------------------- |
| 1    | ls [目录名]    | list                 | 查看当前目录下的内容    |
| 2    | pwd            | print work directory | 查看当前所在目录        |
| 3    | cd [目录名]    | change directory     | 切换目录                |
| 4    | touch [文件名] | touch                | 如果文件不存在,创建文件 |
| 5    | mkdir [目录名] | make directory       | 创建目录                |
| 6    | rm [文件名]    | remove               | 删除指定文件            |

接下来，我们快速的来演示一下这些常用的指令。

**1). ls**

![image-20210810182042076](/assets/images/Java/Linux/image-20210810182042076.png)

> 指令解读:
>
> ​ ls 查看当前目录下的内容(文件及目录)
>
> ​ ls / 查看指定目录(/)下的内容

**2). pwd**

![image-20210810182335470](/assets/images/Java/Linux/image-20210810182335470.png)

> 指令解读:
>
> ​ pwd 查看当前所在目录

**3). cd**

![image-20210810182607821](/assets/images/Java/Linux/image-20210810182607821.png)

> 指令解读:
>
> ​ cd / 切换到根目录
>
> ​ cd /root 切换到/root目录

**4). touch**

![image-20210810182917750](/assets/images/Java/Linux/image-20210810182917750.png)

> 指令解读:
>
> ​ touch 1.txt 创建文件1.txt
>
> ​ touch 2.txt 3.txt 4.txt 一次性创建文件2.txt,3.txt,3.txt

**5). mkdir**

![image-20210810183154023](/assets/images/Java/Linux/image-20210810183154023.png)

> 指令解读:
>
> ​ mkdir 01 创建文件夹01

**6). rm**

![image-20210810183522849](/assets/images/Java/Linux/image-20210810183522849.png)

> 指令解读:
>
> ​ rm 4.txt 删除文件 (删除文件时,需要确认,输入y, 代表确定)

**注意:**

​ ![image-20210810184600425](/assets/images/Java/Linux/image-20210810184600425.png)

​ ==在执行Linux命令时，提示信息如果显示为乱码，如上图所示。这是由于编码问题导致，只需要修改Linux的编码即可，命令如下：==

```
echo 'LANG="en_US.UTF-8"' >> /etc/profile
source /etc/profile
```

#### 3.1.2 Linux命令使用技巧

在我们使用Linux系统命令时，可以使用以下几个技巧：

1). Tab键自动补全

2). 连续两次Tab键，给出操作提示

3). 使用上下箭头快速调出曾经使用过的命令

4). 使用clear命令或者Ctrl+l快捷键实现清屏

**操作示例:**

A. 执行指令的时候，对于操作的文件/目录，按一下Tab会自动补全:

![image-20210810185641027](/assets/images/Java/Linux/image-20210810185641027.png)

B. 如果上述以 "1." 开头的文件有多个，可以按两下Tab键，给出操作提示:

![image-20210810190101671](/assets/images/Java/Linux/image-20210810190101671.png)

C. 使用clear命令或者Ctrl+l快捷键实现清屏:

![image-20210810190458929](/assets/images/Java/Linux/image-20210810190458929.png)

清屏之后，界面就变得干净了:

![image-20210810190546209](/assets/images/Java/Linux/image-20210810190546209.png)

#### 3.1.3 Linux命令格式

```
command [-options] [parameter]

说明:
	command: 	 命令名
	[-options]:  选项，可用来对命令进行控制，也可以省略
	[parameter]: 传给命令的参数，可以是零个、一个或者多个

注意:
	[] 	 代表可选
	命令名、选项、参数之间有空格进行分隔
```

**操作示例:**

![image-20210810192202455](/assets/images/Java/Linux/image-20210810192202455.png)

### 3.2 文件目录操作命令

#### 3.2.1 ls

```
作用: 显示指定目录下的内容
语法: ls [-al] [dir]
说明:
	-a 显示所有文件及目录 (. 开头的隐藏文件也会列出)
	-l 除文件名称外，同时将文件型态(d表示目录，-表示文件)、权限、拥有者、文件大小等信息详细列出

注意:
	由于我们使用ls命令时经常需要加入-l选项，所以Linux为ls -l命令提供了一种简写方式，即ll

常见用法:
	ls -al 	查看当前目录的所有文件及目录详细信息
	ls -al /etc   查看/etc目录下所有文件及目录详细信息
	ll  	查看当前目录文件及目录的详细信息
```

**操作示例:**

![image-20210810193149925](/assets/images/Java/Linux/image-20210810193149925.png)

![image-20210810193302047](/assets/images/Java/Linux/image-20210810193302047.png)

![image-20210810193605487](/assets/images/Java/Linux/image-20210810193605487.png)

![image-20210810194129919](/assets/images/Java/Linux/image-20210810194129919.png)

#### 3.2.2 cd

```
作用: 用于切换当前工作目录，即进入指定目录
语法: cd [dirName]

特殊说明:
	~	表示用户的home目录
	. 	表示目前所在的目录
	.. 	表示目前目录位置的上级目录

举例:
	cd 	..		切换到当前目录的上级目录
	cd 	~		切换到用户的home目录
	cd 	/usr/local	切换到/usr/local目录
```

> 备注:
>
> ​ 用户的home目录
>
> ​ root用户 /root
>
> ​ 其他用户 /home/xxx

操作示例:

![image-20210810230949775](/assets/images/Java/Linux/image-20210810230949775.png)

![image-20210810231024129](/assets/images/Java/Linux/image-20210810231024129.png)

cd .. 切换到当前目录位置的上级目录; 可以通过 cd ../.. 来切换到上级目录的上级目录。

#### 3.2.3 cat

```
作用: 用于显示文件内容
语法: cat [-n] fileName

说明:
	-n: 由1开始对所有输出的行数编号

举例:
	cat /etc/profile		查看/etc目录下的profile文件内容
```

**操作演示:**

![image-20210810231651338](/assets/images/Java/Linux/image-20210810231651338.png)

cat 指令会一次性查看文件的所有内容，如果文件内容比较多，这个时候查看起来就不是很方便了，这个时候我们可以通过一个新的指令more。

#### 3.2.4 more

```
作用: 以分页的形式显示文件内容
语法: more fileName

操作说明:
		回车键 	向下滚动一行
		空格键 	向下滚动一屏
		b 		返回上一屏
		q或者Ctrl+C	退出more

举例：
	more /etc/profile		以分页方式显示/etc目录下的profile文件内容
```

**操作示例：**

<img src="/assets/images/Java/Linux/image-20210810232212430.png" alt="image-20210810232212430" style="zoom:80%;" />

当我们在查看一些比较大的文件时，我们可能需要经常查询文件尾部的数据信息，那这个时候如果文件很大，我们要一直向下翻页，直到最后一页，去看最新添加的数据，这种方式就比较繁琐了，此时，我们可以借助于tail指令。

#### 3.2.5 tail

```
作用: 查看文件末尾的内容
语法: tail [-f] fileName

说明:
	-f : 动态读取文件末尾内容并显示，通常用于日志文件的内容输出

举例:
tail /etc/profile		显示/etc目录下的profile文件末尾10行的内容
tail -20 /etc/profile	显示/etc目录下的profile文件末尾20行的内容
tail -f /itcast/my.log	动态读取/itcast目录下的my.log文件末尾内容并显示
```

**操作示例：**

A. 默认查询文件尾部10行记录

![image-20210810232758510](/assets/images/Java/Linux/image-20210810232758510.png)

B. 可以通过指定参数设置查询尾部指定行数的数据

![image-20210810232947018](/assets/images/Java/Linux/image-20210810232947018.png)

C. 动态读取文件尾部的数据

![image-20210810233514284](/assets/images/Java/Linux/image-20210810233514284.png)

在窗口1中执行指令 `tail -f 1.txt` 动态查看文件尾部的数据。然后在顶部的标签中右键选择 "复制标签"，打开新的窗口2 , 此时再新打开的窗口2中执行指令 `echo 1 >> 1.txt` , 往1.txt文件尾部追加内容，然后我们就可以在窗口1中看到最新的文件尾部的数据。

如果我们不想查看文件尾部的数据了，可以直接使用快捷键 Ctrl+C ， 结束当前进程。

#### 3.2.6 mkdir

```
作用: 创建目录
语法: mkdir [-p] dirName

说明:
	-p: 确保目录名称存在，不存在的就创建一个。通过此选项，可以实现多层目录同时创建

举例:
		mkdir itcast  在当前目录下，建立一个名为itcast的子目录
		mkdir -p itcast/test   在工作目录下的itcast目录中建立一个名为test的子目录，若itcast目录不存在，则建立一个
```

**操作演示:**

![image-20210810234541073](/assets/images/Java/Linux/image-20210810234541073.png)

#### 3.2.7 rmdir

```
作用: 删除空目录
语法: rmdir [-p] dirName

说明:
	-p: 当子目录被删除后使父目录为空目录的话，则一并删除

举例:
		rmdir itcast   删除名为itcast的空目录
		rmdir -p itcast/test   删除itcast目录中名为test的子目录，若test目录删除后itcast目录变为空目录，则也被删除
		rmdir itcast*   删除名称以itcast开始的空目录
```

**操作演示:**

A. 删除空目录

![image-20210810235044921](/assets/images/Java/Linux/image-20210810235044921.png)

B. 删除非空目录

![image-20210810235221722](/assets/images/Java/Linux/image-20210810235221722.png)

C. 使用\*通配符删除目录

![image-20210810235305140](/assets/images/Java/Linux/image-20210810235305140.png)

> \*: 是一个通配符，代表任意字符；
>
> rmdir itcast\* : 删除以itcast开头的目录
>
> rmdir \*itcast : 删除以itcast结尾的目录

#### 3.2.8 rm

```
作用: 删除文件或者目录
语法: rm [-rf] name

说明:
		-r: 将目录及目录中所有文件（目录）逐一删除，即递归删除
		-f: 无需确认，直接删除

举例:
		rm -r itcast/     删除名为itcast的目录和目录中所有文件，删除前需确认
		rm -rf itcast/    无需确认，直接删除名为itcast的目录和目录中所有文件
		rm -f hello.txt   无需确认，直接删除hello.txt文件

```

**操作示例:**

![image-20210810235809473](/assets/images/Java/Linux/image-20210810235809473.png)

==注意: 对于 rm -rf xxx 这样的指令，在执行的时候，一定要慎重，确认无误后再进行删除，避免误删。==

### 3.3 拷贝移动命令

#### 3.3.1 cp

```
作用: 用于复制文件或目录
语法: cp [-r] source dest

说明:
	-r: 如果复制的是目录需要使用此选项，此时将复制该目录下所有的子目录和文件

举例:
		cp hello.txt itcast/            将hello.txt复制到itcast目录中
		cp hello.txt ./hi.txt           将hello.txt复制到当前目录，并改名为hi.txt
		cp -r itcast/ ./itheima/    	将itcast目录和目录下所有文件复制到itheima目录下
		cp -r itcast/* ./itheima/ 	 	将itcast目录下所有文件复制到itheima目录下
```

**操作示例:**

![image-20210811180508369](/assets/images/Java/Linux/image-20210811180508369.png)

![image-20210811180638556](/assets/images/Java/Linux/image-20210811180638556.png)

![image-20210811180914417](/assets/images/Java/Linux/image-20210811180914417.png)

如果拷贝的内容是目录，需要加上参数 -r

#### 3.3.2 mv

```
作用: 为文件或目录改名、或将文件或目录移动到其它位置
语法: mv source dest

举例:
		mv hello.txt hi.txt                 将hello.txt改名为hi.txt
		mv hi.txt itheima/                  将文件hi.txt移动到itheima目录中
		mv hi.txt itheima/hello.txt   		将hi.txt移动到itheima目录中，并改名为hello.txt
		mv itcast/ itheima/                 如果itheima目录不存在，将itcast目录改名为itheima
		mv itcast/ itheima/                 如果itheima目录存在，将itcast目录移动到itheima目录中
```

**操作示例:**

mv 命令既能够改名，又可以移动，具体是改名还是移动,系统会根据我们输入的参数进行判定(如果第二个参数dest是一个已存在的目录,将执行移动操作,其他情况都是改名)

![image-20210811184240003](/assets/images/Java/Linux/image-20210811184240003.png)

### 3.4 打包压缩命令

```
作用: 对文件进行打包、解包、压缩、解压
语法: tar  [-zcxvf]  fileName  [files]
		包文件后缀为.tar表示只是完成了打包，并没有压缩
		包文件后缀为.tar.gz表示打包的同时还进行了压缩

说明:
		-z: z代表的是gzip，通过gzip命令处理文件，gzip可以对文件压缩或者解压
		-c: c代表的是create，即创建新的包文件
		-x: x代表的是extract，实现从包文件中还原文件
		-v: v代表的是verbose，显示命令的执行过程
		-f: f代表的是file，用于指定包文件的名称

举例：
		打包
				tar -cvf hello.tar ./*		  		将当前目录下所有文件打包，打包后的文件名为hello.tar
				tar -zcvf hello.tar.gz ./*		  	将当前目录下所有文件打包并压缩，打包后的文件名为hello.tar.gz

		解包
				tar -xvf hello.tar		  			将hello.tar文件进行解包，并将解包后的文件放在当前目录
				tar -zxvf hello.tar.gz		  		将hello.tar.gz文件进行解压，并将解压后的文件放在当前目录
				tar -zxvf hello.tar.gz -C /usr/local     将hello.tar.gz文件进行解压，并将解压后的文件放在/usr/local目录

```

**操作示例:**

A. 打包

![image-20210811185728541](/assets/images/Java/Linux/image-20210811185728541.png)

B. 打包并压缩

![image-20210811190035256](/assets/images/Java/Linux/image-20210811190035256.png)

C. 解包

![image-20210811190307630](/assets/images/Java/Linux/image-20210811190307630.png)

D. 解压

![image-20210811190450820](/assets/images/Java/Linux/image-20210811190450820.png)

解压到指定目录,需要加上参数 -C

![image-20210811190626414](/assets/images/Java/Linux/image-20210811190626414.png)

### 3.5 文本编辑命令

文本编辑的命令，主要包含两个: vi 和 vim，两个命令的用法类似，我们课程中主要讲解vim的使用。

#### 3.5.1 vi&vim介绍

作用: vi命令是Linux系统提供的一个文本编辑工具，可以对文件内容进行编辑，类似于Windows中的记事本

语法: vi fileName

说明:
1). vim是从vi发展来的一个功能更加强大的文本编辑工具，编辑文件时可以对文本内容进行着色，方便我们对文件进行编辑处理，所以实际工作中vim更加常用。
2). 要使用vim命令，需要我们自己完成安装。可以使用下面的命令来完成安装：`yum install vim`

#### 3.5.2 vim安装

命令： yum install vim

![image-20210811192217715](/assets/images/Java/Linux/image-20210811192217715.png)

安装过程中，会有确认提示，此时输入 y，然后回车，继续安装：

![image-20210811192256269](/assets/images/Java/Linux/image-20210811192256269.png)

![image-20210811192350907](/assets/images/Java/Linux/image-20210811192350907.png)

#### 3.5.3 vim使用

作用: 对文件内容进行编辑，vim其实就是一个文本编辑器
语法: vim fileName
说明:
1). 在使用vim命令编辑文件时，如果指定的文件存在则直接打开此文件。如果指定的文件不存在则新建文件。
2). vim在进行文本编辑时共分为三种模式，分别是 命令模式（Command mode），插入模式（Insert mode）和底行模式（Last line mode）。这三种模式之间可以相互切换。我们在使用vim时一定要注意我们当前所处的是哪种模式。

三种模式: - 命令模式
A. 命令模式下可以查看文件内容、移动光标（上下左右箭头、gg、G）
B. 通过vim命令打开文件后，默认进入命令模式
C. 另外两种模式需要首先进入命令模式，才能进入彼此
| 命令模式指令 | 含义 |
| ------------ | --------------------------------- |
| gg | 定位到文本内容的第一行 |
| G | 定位到文本内容的最后一行 |
| dd | 删除光标所在行的数据 |
| ndd | 删除当前光标所在行及之后的n行数据 |
| u | 撤销操作 |
| shift+zz | 保存并退出 |
| i 或 a 或 o | 进入插入模式 |

​

     - 插入模式
    		A. 插入模式下可以对文件内容进行编辑
    		B. 在命令模式下按下[i,a,o]任意一个，可以进入插入模式。进入插入模式后，下方会出现【insert】字样
    		C. 在插入模式下按下ESC键，回到命令模式



     - 底行模式
    		A. 底行模式下可以通过命令对文件内容进行查找、显示行号、退出等操作
    		B. 在命令模式下按下[:,/]任意一个，可以进入底行模式
    		C. 通过/方式进入底行模式后，可以对文件内容进行查找
    		D. 通过:方式进入底行模式后，可以输入wq（保存并退出）、q!（不保存退出）、set nu（显示行号）

    		| 底行模式命令 | 含义                                 |
    		| ------------ | ------------------------------------ |
    		| :wq          | 保存并退出                           |
    		| :q!          | 不保存退出                           |
    		| :set nu      | 显示行号                             |
    		| :set nonu    | 取消行号显示                         |
    		| :n           | 定位到第n行, 如 :10 就是定位到第10行 |

​ <img src="/assets/images/Java/Linux/image-20210811194627474.png" alt="image-20210811194627474" style="zoom: 80%;" />

​

**操作示例:**

![image-20210811200005097](/assets/images/Java/Linux/image-20210811200005097.png)

### 3.6 查找命令

#### 3.6.1 find

```
作用: 在指定目录下查找文件
语法: find dirName -option fileName
举例:
		find  .  –name "*.java"			在当前目录及其子目录下查找.java结尾文件
		find  /itcast  -name "*.java"	在/itcast目录及其子目录下查找.java结尾的文件
```

**操作示例:**

![image-20210811200438459](/assets/images/Java/Linux/image-20210811200438459.png)

#### 3.6.2 grep

```
作用: 从指定文件中查找指定的文本内容
语法: grep word fileName
举例:
		grep Hello HelloWorld.java	查找HelloWorld.java文件中出现的Hello字符串的位置
		grep hello *.java			查找当前目录中所有.java结尾的文件中包含hello字符串的位置
```

**操作示例:**

![image-20210811200737596](/assets/images/Java/Linux/image-20210811200737596.png)

## 4. 软件安装

### 4.1 软件安装方式

在Linux系统中，安装软件的方式主要有四种，这四种安装方式的特点如下：

| 安装方式         | 特点                                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------------------- |
| 二进制发布包安装 | 软件已经针对具体平台编译打包发布，只要解压，修改配置即可                                                      |
| rpm安装          | 软件已经按照redhat的包管理规范进行打包，使用rpm命令进行安装，==不能自行解决库依赖问题==                       |
| yum安装          | 一种在线软件安装方式，本质上还是rpm安装，自动下载安装包并安装，安装过程中自动解决库依赖问题(安装过程需要联网) |
| 源码编译安装     | 软件以源码工程的形式发布，需要自己编译打包                                                                    |

### 4.2 安装JDK

上述我们介绍了Linux系统软件安装的四种形式，接下来我们就通过第一种(二进制发布包)形式来安装JDK。 JDK对应的二进制发布包，在课程资料中已经提供，如下：<img src="/assets/images/Java/Linux/image-20231213233939787.png" alt="image-20231213233939787"  />

JDK具体安装步骤如下：

**1). 上传安装包**

使用FinalShell自带的上传工具将jdk的二进制发布包上传到Linux

![image-20231213234849748](/assets/images/Java/Linux/image-20231213234849748.png)

由于上述在进行文件上传时，选择的上传目录为根目录 /，上传完毕后，我们执行指令 cd / 切换到根目录下，查看上传的安装包。

![image-20231213235018977](/assets/images/Java/Linux/image-20231213235018977.png)

**2). 解压安装包**

执行如下指令，将上传上来的压缩包进行解压，并通过-C参数指定解压文件存放目录为 /usr/local。

```
tar -zxvf jdk-21_linux-x64_bin.tar.gz -C /usr/local/
```

![image-20231213235114053](/assets/images/Java/Linux/image-20231213235114053.png)

**3). 配置环境变量**

使用vim命令修改/etc/profile文件，在文件末尾加入如下配置

```
export JAVA_HOME=/usr/local/jdk-21.0.1
export PATH=$JAVA_HOME/bin:$PATH
```

具体操作指令如下:

```
1). 编辑/etc/profile文件，进入命令模式
	vim /etc/profile

2). 在命令模式中，输入指令 G ， 切换到文件最后
	G

3). 在命令模式中输入 i/a/o 进入插入模式，然后切换到文件最后一行
	i

4). 将上述的配置拷贝到文件中
	export JAVA_HOME=/usr/local/jdk-21.0.1
	export PATH=$JAVA_HOME/bin:$PATH

5). 从插入模式，切换到指令模式
	ESC

6). 按:进入底行模式，然后输入wq，回车保存
	:wq
```

**4). 重新加载profile文件**

为了使更改的配置立即生效，需要重新加载profile文件，执行命令:

```
source /etc/profile
```

**5). 检查安装是否成功**

```
java -version
```

![image-20231213235354460](/assets/images/Java/Linux/image-20231213235354460.png)

### 4.3 安装MySQL

#### 4.3.1 MySQL安装

对于MySQL数据库的安装，我们将要使用前面讲解的第一种安装方式进行安装。

**1). 准备工作**

在安装MySQL数据库之前，我们需要先检查一下当前Linux系统中，是否安装的有MySQL的相关服务（很多linux安装完毕之后，自带了低版本的mysql的依赖包），如果有，先需要卸载掉，然后再进行安装。

A. 通过rpm相关指令，来**查询**当前系统中是否存在已安装的mysql软件包，执行指令如下：

```
rpm -qa							查询当前系统中安装的所有软件
rpm -qa | grep mysql			 查询当前系统中安装的名称带mysql的软件
rpm -qa | grep mariadb			 查询当前系统中安装的名称带mariadb的软件
```

通过rpm -qa 查询到系统通过rpm安装的所有软件，太多了，不方便查看，所以我们可以通过管道符 | 配合着grep进行过滤查询。

![image-20231213235536195](/assets/images/Java/Linux/image-20231213235536195.png)

通过查询，我们发现在当前系统中存在mariadb数据库，是CentOS7中自带的，而这个数据库和MySQL数据库是冲突的，所以要想保证MySQL成功安装，需要卸载mariadb数据库。

> **RPM：**全称为 Red-Hat Package Manager，RPM软件包管理器，是红帽Linux用于管理和安装软件的工具。

B. 通过 rpm 相关指令，来卸载对应的组件，执行指令如下：

在rpm中，卸载软件的语法为：

```
rpm -e --nodeps  软件名称
```

那么，我们就可以通过指令，卸载 mariadb，具体指令为：

```
rpm -e --nodeps mariadb-libs-5.5.60-1.el7_5.x86_64
```

![image-20231213235609157](/assets/images/Java/Linux/image-20231213235609157.png)

我们看到执行完毕之后， 再次查询 mariadb，就查不到了，因为已经被成功卸载了。

**2). 将资料中提供的MySQL安装包上传到Linux并解压**

A. 上传MySQL安装包

在课程资料中，提供的有MySQL的安装包 ，我们需要将该安装包上传到Linux系统的根目录 / 下面。

![image-20230429222125294](/assets/images/Java/Linux/image-20230429222125294-17024819391888.png)

![image-20230429222202648](/assets/images/Java/Linux/image-20230429222202648-17024819391899.png)

B. 解压到 当前目录

执行如下指令:

```
tar -xvf mysql-8.0.30-linux-glibc2.12-x86_64.tar.xz
```

![image-20230429222328342](/assets/images/Java/Linux/image-20230429222328342-170248193918910.png)

C. 将解压后的文件夹移动到 /usr/local 目录下， 并改名为 mysql

```
mv mysql-8.0.30-linux-glibc2.12-x86_64 /usr/local/mysql

cd /usr/local/mysql
```

**3). 配置系统环境变量**

配置MySQL的环境变量, 通过vi编辑器编辑 `/etc/profile` 文件, 在尾部追加:

```
export MYSQL_HOME=/usr/local/mysql
export PATH=$MYSQL_HOME/bin:$PATH
```

**4). 重新加载profile文件**

为了使更改的配置立即生效，需要重新加载profile文件，执行命令:

```
source /etc/profile
```

并执行如下指令, 注册MySQL为系统服务:

```
cp /usr/local/mysql/support-files/mysql.server /etc/init.d/mysql

chkconfig --add mysql
```

**5). 初始化数据库**

```shell
#创建一个用户组, 组名就叫mysql
groupadd mysql

#创建一个系统用户 mysql, 并归属于用户组 mysql ,
useradd -r -g mysql -s /bin/false mysql
```

```shell
#初始化mysql
mysqld --initialize --user=mysql --basedir=/usr/local/mysql --datadir=/usr/local/mysql/data
```

执行上述指令时, 会输入如下日志，在日志中就输出了MySQL中root用户的一个临时密码【**记得复制出来，记录下来**】：

![image-20230429223328058](/assets/images/Java/Linux/image-20230429223328058-170248193918911.png)

#### 1.3.2 启动MySQL

A. 启动MySQL服务

```shell
systemctl start mysql
```

B. 通过命令, 登录MySQL

```shell
#xxxxx 代表上述生成的root的临时密码
mysql -uroot -pxxxxx
```

![image-20230429223546041](/assets/images/Java/Linux/image-20230429223546041-170248193918912.png)

#### 1.3.3 配置MySQL

A. 修改root用户的密码

```shell
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '1234';
```

![image-20230429224538029](/assets/images/Java/Linux/image-20230429224538029-170248193918913.png)

**注意: 这个root账号仅仅能够在本机localhost上访问，我们在windows上是无法访问的。如果需要在window上或其他服务器上也能远程访问，需要创建一个账号，用于远程访问的。**

D. 创建账号, 并授权远程访问

```shell
CREATE USER 'root'@'%' IDENTIFIED BY '1234';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%';
FLUSH PRIVILEGES;
```

![image-20230429224602068](/assets/images/Java/Linux/image-20230429224602068-170248193918914.png)

我们已经开启了MySQL的远程访问的权限，为什么还是连接不上MySQL服务器呢？？ 这是因为Linux系统的防火墙，将我们的访问拦截了。

![image-20231214000139253](/assets/images/Java/Linux/image-20231214000139253.png)

#### 1.3.4 防火墙操作

Linux系统安装完毕后，系统启动时，防火墙自动启动，防火墙拦截了所有端口的访问。接下来我们就需要学习一下，如何操作防火墙，具体指令如下：

| 操作                         | 指令                                                          | 备注             |
| ---------------------------- | ------------------------------------------------------------- | ---------------- |
| 查看防火墙状态               | systemctl status firewalld / firewall-cmd --state             |                  |
| 暂时关闭防火墙               | systemctl stop firewalld                                      |                  |
| 永久关闭防火墙(禁用开机自启) | systemctl disable firewalld                                   | 下次启动,才生效  |
| 暂时开启防火墙               | systemctl start firewalld                                     |                  |
| 永久开启防火墙(启用开机自启) | systemctl enable firewalld                                    | 下次启动,才生效  |
| 开放指定端口                 | firewall-cmd --zone=public --add-port=8080/tcp --permanent    | 需要重新加载生效 |
| 关闭指定端口                 | firewall-cmd --zone=public --remove-port=8080/tcp --permanent | 需要重新加载生效 |
| 立即生效(重新加载)           | firewall-cmd --reload                                         |                  |
| 查看开放端口                 | firewall-cmd --zone=public --list-ports                       |                  |

注意： 要想在windows上能够访问MySQL，需要开放防火墙的3306端口 或者 直接关闭防火墙 ，执行如下指令:

```shell
#开发防火墙的3306端口号
firewall-cmd --zone=public --add-port=3306/tcp --permanent

#重新加载
firewall-cmd --reload

#查看开放的端口号
firewall-cmd --zone=public --list-ports
```

![image-20230429225048715](/assets/images/Java/Linux/image-20230429225048715-170248193918916.png)

或者直接关闭防火墙:

```shell
systemctl stop firewalld
```

![image-20230429225303564](/assets/images/Java/Linux/image-20230429225303564-170248193918917.png)

#### 1.3.5 连接测试

关闭掉linux系统的防火墙之后，我们就可以打开windows上的命令行，通过mysql的客户端(命令行/图形化界面)来连接远程linux上安装的MySQL数据库了。

1). 客户端连接

![image-20231214000235375](/assets/images/Java/Linux/image-20231214000235375.png)

2). 测试导入SQL脚本

连接上linux上的mysql数据库之后, 我们可以将资料中提供的项目的SQL脚本 `tlias.sql` 中的SQL语句复制出来，在命令行中执行，导入数据库。

![image-20231214001539562](/assets/images/Java/Linux/image-20231214001539562.png)

![image-20231214001553360](/assets/images/Java/Linux/image-20231214001553360.png)

### 4.4 安装Nginx

#### 4.4.1 安装Nginx

Nginx的安装包，从官方下载下来的是c语言的源码包，我们需要自己编译安装。具体操作步骤如下：

1). 安装Nginx运行时需要的依赖

```
yum install -y pcre pcre-devel zlib zlib-devel openssl openssl-devel
```

安装C语言的编译环境.

```
yum install gcc-c++
```

2). 上传Nginx的源码包

<img src="/assets/images/Java/Linux/image-20230430180721921-170248193919028.png" alt="image-20230430180721921" style="zoom:67%;" />

3). 解压源码包到当前目录

```
tar -zxvf nginx-1.20.2.tar.gz
```

4). 进入到解压目录后，执行指令

```shell
#进入解压目录
cd nginx-1.20.2

#执行命令配置, 生成Makefile文件
./configure --prefix=/usr/local/nginx
```

5). 执行命令进行编译和安装

```shell
#编译
make

#编译安装
make install
```

#### 4.4.2 启动Nginx

进入到nginx安装目录`/usr/local/nginx`，启动nginx服务

```
cd /usr/local/nginx/
```

```
sbin/nginx
```

启动完毕之后，我们可以通过 `ps` 指令查询当前系统中的nginx进程，从而确认nginx是否启动 。

![image-20231214153612883](/assets/images/Java/Linux/image-20231214153612883.png)

然后，我们就可以打开浏览器，访问服务器上的nginx 。

![image-20231214153648792](/assets/images/Java/Linux/image-20231214153648792.png)

#### 4.4.3 部署前端项目

1). 将资料中提供的 "nginx部署" 目录下的文件夹 "sky" 上传到nginx安装目录下的 html 目录中.

![image-20231214155542604](/assets/images/Java/Linux/image-20231214155542604.png)

2). 修改资料中提供的 `nginx.conf` 配置文件，将其上传到nginx安装目录下的 conf 目录中.

![image-20231214155812367](/assets/images/Java/Linux/image-20231214155812367.png)

3). 重新加载nginx服务的配置文件

```shell
#重新加载配置文件
sbin/nginx -s reload
```

4). 再次访问nginx (可能会存在浏览器缓存, 可以按Ctrl+F5, 强制刷新清理缓存)

![image-20231214155833714](/assets/images/Java/Linux/image-20231214155833714.png)

> nginx服务常见操作指令:
>
> ​ 启动: sbin/nginx
>
> ​ 重载: sbin/nginx -s reload
>
> ​ 停止: sbin/nginx -s stop

## 5. 项目部署

之前我们讲解Linux操作系统时，就提到，我们服务端开发工程师学习Linux系统的目的就是将来我们开发的项目绝大部分情况下都需要部署在Linux系统中。

#### 5.1 环境准备

那现在，项目要上线了，要部署到linux服务器上了，我们也需要使用linux服务器上所安装的mysql数据库。

那此时，我们就可以再准备一份文件 `application.yml` 将里面的配置的mysql的ip地址及相关配置信息修改一下（配置Linux上安装的MySQL的信息）：

```yml
#数据库连接四要素
spring:
	datasource:
		driver-class-name: com.mysql.cj.jdbc.Driver
		url: jdbc:mysql://192.168.138.128:3306/tlias
		username: root
		password: 1234
	servlet:
		multipart:
			max-file-size: 10MB
			max-request-size: 100MB

#mybatis配置
mybatis:
	configuration:
		log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
		map-underscore-to-camel-case: true
logging:
	level:
		org.springframework.jdbc.support.JdbcTransactionManager: debug

#阿里云
aliyun:
	oss:
		endpoint: https://oss-cn-beijing.aliyuncs.com
		bucketName: java417-web
```

改造完毕之后，可以在本地的idea中先启动当前项目，然后访问一下，看看工程是否正常访问。

![image-20231214160539025](/assets/images/Java/Linux/image-20231214160539025.png)

#### 2.1.2 打包部署

1). 执行 `package` 指令，进行打包操作，将当前的springboot项目，打成一个jar包。

 <img src="/assets/images/Java/Linux/image-20231214160641995.png" alt="image-20231214160641995" style="zoom:80%;" />

2). 在Linux服务器上创建一个目录，将jar包上传到服务器 。

```
mkdir -p /usr/local/app
```

3). 通过java命令，启动项目

```shell
#进入目录/usr/local/app
cd /usr/local/app

#运行jar包
java -jar sky-server-1.0-SNAPSHOT.jar
```

![image-20230430203222428](/assets/images/Java/Linux/image-20230430203222428-17025410066194.png)

当前程序中存在的问题:

- 线上程序不会采用控制台霸屏的形式运行程序，而是将程序在后台运行

- 线上程序不会将日志输出到控制台，而是输出到日志文件，方便运维查阅信息

要解决上述这两个问题，我们就可以通过 nohup 指令让程序在后台运行。

#### 2.1.3 后台运行

1). 后台运行程序

```
nohup  java –jar sky-server-1.0-SNAPSHOT.jar  &> sky.log &
```

通过上述指令就可以后台运行服务，服务运行之后， 所有的日志信息都会输出到 sky.log 文件中。

![image-20230430204336223](/assets/images/Java/Linux/image-20230430204336223-17025410066205.png)

2). 停止服务

```shell
#查看服务的进程信息
ps -ef|grep sky

#杀掉进程
kill -9 xxxxx
```

![image-20230430203820612](/assets/images/Java/Linux/image-20230430203820612-17025410066206.png)

> **nohup命令说明:**
>
> ​ **nohup命令：** 英文全称 no hang up（不挂起），用于不挂断地运行指定命令，退出终端不会影响程序的运行
>
> ​ **语法格式：** nohup Command [ Arg … ] [&]
>
> ​ **参数说明：**
>
> ​ Command：要执行的命令
>
> ​ Arg：一些参数，可以指定输出文件
>
> ​ &：让命令在后台运行
>
> ​ **举例：**
>
> ​ nohup java -jar boot工程.jar &> hello.log &
>
> ​ 上述指令的含义为： 后台运行 java -jar 命令，并将日志输出到hello.log文件
