# 新增员工

前面我们已经实现了员工信息的条件分页查询。 那今天我们要实现的是新增员工的功能实现，页面原型如下：

<img src="/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203164759377.png" alt="image-20231203164759377" style="zoom:80%;" />

首先我们先完成"新增员工"的功能开发，而在"新增员工"中，需要添加头像，而头像需要用到"文件上传"技术。 当整个员工管理功能全部开发完成之后，我们再通过配置文件来优化一些内容。

综上所述，我们今天的课程内容包含以下四个部分：

- 新增员工
- 事务管理
- 文件上传
- 配置文件

## 1. 新增员工

### 1.1 需求

<img src="/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203165015822.png" alt="image-20231203165015822" style="zoom: 75%;" />

在添加员工信息时，录入的信息包括两个部分，一个部分是员工的基本信息； 另一个部分是员工的工作经历信息，那这两部分信息最终在录入完成后，点击 "保存" 按钮后都会提交到服务器端。

最终，员工的基本信息是要保存在员工表 `emp` 中的。 而 员工的工作经历信息，要保存在员工工作经历信息表 `emp_expr` 中的。

### 1.2 接口文档

我们参照接口文档来开发新增员工功能

- 基本信息

  ```
  请求路径：/emps

  请求方式：POST

  接口描述：该接口用于添加员工的信息
  ```

- 请求参数

  参数格式：application/json

  参数说明：

  | 名称        | 类型     | 是否必须 | 备注                                                          |
  | ----------- | -------- | -------- | ------------------------------------------------------------- |
  | username    | string   | 必须     | 用户名                                                        |
  | name        | string   | 必须     | 姓名                                                          |
  | gender      | number   | 必须     | 性别, 说明: 1 男, 2 女                                        |
  | image       | string   | 非必须   | 图像                                                          |
  | deptId      | number   | 非必须   | 部门 id                                                       |
  | entryDate   | string   | 非必须   | 入职日期                                                      |
  | job         | number   | 非必须   | 职位, 说明: 1 班主任,2 讲师, 3 学工主管, 4 教研主管, 5 咨询师 |
  | salary      | number   | 非必须   | 薪资                                                          |
  | exprList    | object[] | 非必须   | 工作经历列表                                                  |
  | \|- company | string   | 非必须   | 所在公司                                                      |
  | \|- job     | string   | 非必须   | 职位                                                          |
  | \|- begin   | string   | 非必须   | 开始时间                                                      |
  | \|- end     | string   | 非必须   | 结束时间                                                      |

  请求数据样例：

  ```json
  {
    "image": "https://web-framework.oss-cn-hangzhou.aliyuncs.com/2022-09-03-07-37-38222.jpg",
    "username": "linpingzhi",
    "name": "林平之",
    "gender": 1,
    "job": 1,
    "entryDate": "2022-09-18",
    "deptId": 1,
    "phone": "18809091234",
    "salary": 8000,
    "exprList": [
      {
        "company": "百度科技股份有限公司",
        "job": "java开发",
        "begin": "2012-07-01",
        "end": "2019-03-03"
      },
      {
        "company": "阿里巴巴科技股份有限公司",
        "job": "架构师",
        "begin": "2019-03-15",
        "end": "2023-03-01"
      }
    ]
  }
  ```

- 响应数据

  参数格式：application/json

  参数说明：

  | 参数名 | 类型   | 是否必须 | 备注                           |
  | ------ | ------ | -------- | ------------------------------ |
  | code   | number | 必须     | 响应码，1 代表成功，0 代表失败 |
  | msg    | string | 非必须   | 提示信息                       |
  | data   | object | 非必须   | 返回的数据                     |

  响应数据样例：

  ```json
  {
    "code": 1,
    "msg": "success",
    "data": null
  }
  ```

### 1.3 思路分析

新增员工的具体的流程：

![image-20231203165627940](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203165627940.png)

> 接口文档规定：
>
> - 请求路径：/emps
> - 请求方式：POST
> - 请求参数：Json 格式数据
> - 响应数据：Json 格式数据
>
> 问题 1：如何限定请求方式是 POST？
>
> ```java
> @PostMapping
> ```
>
> 问题 2：怎么在 controller 中接收 json 格式的请求参数？
>
> ```java
> @RequestBody  //把前端传递的json数据填充到实体类中
> ```

### 1.4 功能开发

#### 1.4.1 准备工作

准备的`EmpExprMapper`接口及映射配置文件`EmpExprMapper.xml`，并准备实体类接收前端传递的 json 格式的请求参数。

1). EmpExprMapper 接口

```java
@Mapper
public interface EmpExprMapper {

}
```

2). EmpExprMapper.xml 配置文件

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
				PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
				"http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.itheima.mapper.EmpExprMapper">

</mapper>
```

3). 需要在 `Emp` 员工实体类中增加属性 `exprList` 来封装工作经历数据。 最终完整代码如下：

```java
@Data
public class Emp {
		private Integer id; //ID,主键
		private String username; //用户名
		private String password; //密码
		private String name; //姓名
		private Integer gender; //性别, 1:男, 2:女
		private String phone; //手机号
		private Integer job; //职位, 1:班主任,2:讲师,3:学工主管,4:教研主管,5:咨询师
		private Integer salary; //薪资
		private String image; //头像
		private LocalDate entryDate; //入职日期
		private Integer deptId; //关联的部门ID
		private LocalDateTime createTime; //创建时间
		private LocalDateTime updateTime; //修改时间

		//封装部门名称数
		private String deptName; //部门名称

		//封装员工工作经历信息
		private List<EmpExpr> exprList;
}
```

#### 1.4.2 保存员工基本信息

**1). EmpController**

在 `EmpController` 中增加 save 方法。

```java
/**
 * 添加员工
 */
@PostMapping
public Result save(@RequestBody Emp emp){
		log.info("请求参数emp: {}", emp);
		empService.save(emp);
		return Result.success();
}
```

**2). EmpService & EmpServiceImpl**

在 `EmpService` 中增加 save 方法

```java
/**
* 添加员工
* @param emp
*/
void save(Emp emp);
```

在 `EmpServiceImpl` 中增加 save 方法 , 实现接口中的 save 方法

```java
@Override
public void save(Emp emp) {
		//1.补全基础属性
		emp.setCreateTime(LocalDateTime.now());
		emp.setUpdateTime(LocalDateTime.now());

		//2.保存员工基本信息
		empMapper.insert(emp);

		//3. 保存员工的工作经历信息 - 批量 (稍后完成)

}
```

**3). EmpMapper**

在 `EmpMapper` 中增加 insert 方法，新增员工的基本信息。

```java
/**
* 新增员工数据
*/
@Options(useGeneratedKeys = true, keyProperty = "id")
@Insert("insert into emp(username, name, gender, phone, job, salary, image, entry_date, dept_id, create_time, update_time) " +
"values (#{username},#{name},#{gender},#{phone},#{job},#{salary},#{image},#{entryDate},#{deptId},#{createTime},#{updateTime})")
void insert(Emp emp);
```

> 主键返回：@Options(useGeneratedKeys = true, keyProperty = "id")
>
> 由于稍后，我们在保存工作经历信息的时候，需要记录是哪位员工的工作经历。 所以，保存完员工信息之后，是需要获取到员工的 ID 的，那这里就需要通过 Mybatis 中提供的主键返回功能来获取。

#### 1.4.3 批量保存工作经历

##### 1.4.3.1 分析

一个员工，是可以有多段工作经历的，所以在页面上将来用户录入员工信息时，可以自己根据需要添加多段工作经历。页面原型展示如下：

<img src="/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203171646115.png" alt="image-20231203171646115" style="zoom:80%;" />

那如果员工只有一段工作经历，我们就需要往工作经历表中保存一条记录。 执行的 SQL 如下：

![image-20231203171945533](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203171945533.png)

如果员工有两段工作经历，我们就需要往工作经历表中保存两条记录。执行的 SQL 如下：

![image-20231203171953757](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203171953757.png)

如果员工有三段工作经历，我们就需要往工作经历表中保存三条记录。执行的 SQL 如下：

![image-20231203172001564](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203172001564.png)

所以，这里最终我们需要执行的是批量插入数据的 insert 语句。

##### 1.4.3.2 实现

**1). EmpServiceImpl**

完善 save 方法中保存员工信息的逻辑。完整逻辑如下：

```java
@Override
public void save(Emp emp) {
	//1.补全基础属性
		emp.setCreateTime(LocalDateTime.now());
		emp.setUpdateTime(LocalDateTime.now());
		//2.保存员工基本信息
		empMapper.insert(emp);

		//3. 保存员工的工作经历信息 - 批量
		Integer empId = emp.getId();
		List<EmpExpr> exprList = emp.getExprList();
		if(!CollectionUtils.isEmpty(exprList)){
				exprList.forEach(empExpr -> empExpr.setEmpId(empId));
				empExprMapper.insertBatch(exprList);
		}
}
```

**2). EmpExprMapper**

```java
@Mapper
public interface EmpExprMapper {

		/**
		 * 批量插入员工工作经历信息
		 */
		public void insertBatch(List<EmpExpr> exprList);
}
```

**3). EmpExprMapper.xml**

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper
				PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
				"http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.itheima.mapper.EmpExprMapper">

		<!--批量插入员工工作经历信息-->
		<insert id="insertBatch">
				insert into emp_expr (emp_id, begin, end, company, job) values
				<foreach collection="exprList" item="expr" separator=",">
						(#{expr.empId}, #{expr.begin}, #{expr.end}, #{expr.company}, #{expr.job})
				</foreach>
		</insert>

</mapper>
```

> 这里用到 Mybatis 中的动态 SQL 里提供的 `<foreach>` 标签，改标签的作用，是用来遍历循环，常见的属性说明：
>
> 1. collection：集合名称
> 2. item：集合遍历出来的元素/项
>
> 3. separator：每一次遍历使用的分隔符
>
> 4. open：遍历开始前拼接的片段
>
> 5. close：遍历结束后拼接的片段
>
> 上述的属性，是可选的，并不是所有的都是必须的。 可以自己根据实际需求，来指定对应的属性。

### 1.5 功能测试

代码开发完成后，重启服务器，打开 Apifox 发送 POST 请求，请求路径：http://localhost:8080/emps

![image-20231203172758694](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203172758694.png)

请求完毕后，可以打开 idea 的控制台看到控制台输出的日志：

![image-20231203172911438](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203172911438.png)

### 1.6 前后端联调

功能测试通过后，我们再进行通过打开浏览器，测试后端功能接口：

<img src="/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203173056629.png" alt="image-20231203173056629" style="zoom:80%;" />

点击保存之后，可以看到列表中已经展示出了这条数据。

![image-20231203173135574](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203173135574.png)

## 2. 事务管理

### 2.1 问题分析

目前我们实现的新增员工功能中，操作了两次数据库，执行了两次 insert 操作。

- 第一次：保存员工的基本信息到 `emp` 表中。
- 第二次：保存员工的工作经历信息到 `emp_expr` 表中。

如果说，保存员工的基本信息成功了，而保存员工的工作经历信息出错了，会发生什么现象呢？那接下来，我们来做一个测试 。 我们可以在代码中，人为在保存员工的 service 层的 save 方法中，构造一个错误：

![image-20231203173905601](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203173905601.png)

那接下来，我们就重启服务，打开浏览器，来做一个测试：

<img src="/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203174210524.png" alt="image-20231203174210524" style="zoom:80%;" />

点击 “保存” 之后，提示 “系统接口异常”。

![image-20231203174240731](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203174240731.png)

我们可以打开 IDEA 控制台看一下，报出的错误信息。 我们看到，保存了员工的基本信息之后，系统出现了异常。

![image-20231203174317737](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203174317737.png)

我们再打开数据库，看看表结构中的数据是否正常。

1). `emp` 员工表中是有 `Jerry` 这条数据的。

![image-20231203174422799](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203174422799.png)

2). `emp_expr` 表中没有改员工的工作经历信息。

<img src="/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203174534087.png" alt="image-20231203174534087" style="zoom:80%;" />

最终，我们看到，程序出现了异常 ，员工表 `emp` 数据保存成功了, 但是 `emp_expr` 员工工作经历信息表，数据保存失败了。 那是否允许这种情况发生呢？

- 不允许
- 因为这属于一个业务操作，如果保存员工信息成功了，保存工作经历信息失败了，就会造成数据库数据的不完整、不一致。

那如何解决这个问题呢？ 这需要通过数据库中的事务来解决这个问题。

### 2.2 介绍

**概念：** 事务是一组操作的集合，它是一个不可分割的工作单位。事务会把所有的操作作为一个整体一起向系统提交或撤销操作请求，即这些操作 要么同时成功，要么同时失败。

就拿添加员工的这个业务为例，在这个业务操作中，包含了两个操作，那这两个操作是一个不可分割的工作单位。

![image-20231203174855311](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203174855311.png)

这两个操作，要么同时失败，要么同时成功。

> 默认 MySQL 的事务是自动提交的，也就是说，当执行一条 DML 语句，MySQL 会立即隐式的提交事务。

### 2.3 操作

事务控制主要三步操作：开启事务、提交事务/回滚事务。

- 需要在这组操作执行之前，先开启事务 ( `start transaction; / begin;`)。
- 所有操作如果全部都执行成功，则提交事务 ( `commit;` )。
- 如果这组操作中，有任何一个操作执行失败，都应该回滚事务 ( `rollback` )。

那接下来，我们就可以将添加员工的业务操作，进行事务管理。 具体的 SQL 如下：

```sql
-- 开启事务
start transaction; / begin;

-- 1. 保存员工基本信息
insert into emp values (39, 'Tom', '123456', '汤姆', 1, '13300001111', 1, 4000, '1.jpg', '2023-11-01', 1, now(), now());

-- 2. 保存员工的工作经历信息
insert into emp_expr(emp_id, begin, end, company, job) values (39,'2019-01-01', '2020-01-01', '百度', '开发'),                                                            					   (39,'2020-01-10', '2022-02-01', '阿里', '架构');

-- 提交事务(全部成功)
commit;

-- 回滚事务(有一个失败)
rollback;
```

事务管理的场景，是非常多的，比如：

- 银行转账
- 下单扣减库存

### 2.4 Spring 事务管理

在上述实现的新增员工的功能中，一旦在保存员工基本信息后出现异常。 我们就会发现，员工信息保存成功，但是工作经历信息保存失败，造成了数据的不完整不一致。

<img src="/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203175516003.png" alt="image-20231203175516003" style="zoom:80%;" />

产生原因：

- 先执行新增员工的操作，这步执行完毕，就已经往员工表 `emp` 插入了数据。
- 执行 1/0 操作，抛出异常
- 抛出异常之前，下面所有的代码都不会执行了，批量保存工作经历信息，这个操作也不会执行 。

此时就出现问题了，员工基本信息保存了，员工的工作经历信息未保存，业务操作前后数据不一致。

而要想保证操作前后，数据的一致性，就需要让新增员工中涉及到的两个业务操作，要么全部成功，要么全部失败 。 那我们如何，让这两个操作要么全部成功，要么全部失败呢 ？

那就可以通过事务来实现，因为一个事务中的多个业务操作，要么全部成功，要么全部失败。

此时，我们就需要在新增员工功能中添加事务。

<img src="/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203183433579.png" alt="image-20231203183433579" style="zoom:80%;" />

在方法运行之前，开启事务，如果方法成功执行，就提交事务，如果方法执行的过程当中出现异常了，就回滚事务。

思考：开发中所有的业务操作，一旦我们要进行控制事务，是不是都是这样的套路？

答案：是的。

所以在 spring 框架当中就已经把事务控制的代码都已经封装好了，并不需要我们手动实现。我们使用了 spring 框架，我们只需要通过一个简单的注解@Transactional 就搞定了。

#### 2.4.1 Transactional 注解

> @Transactional 作用：就是在当前这个方法执行开始之前来开启事务，方法执行完毕之后提交事务。如果在这个方法执行的过程当中出现了异常，就会进行事务的回滚操作。
>
> @Transactional 注解：我们一般会在业务层当中来控制事务，因为在业务层当中，一个业务功能可能会包含多个数据访问的操作。在业务层来控制事务，我们就可以将多个数据访问操作控制在一个事务范围内。

@Transactional 注解书写位置：

- 方法
  - 当前方法交给 spring 进行事务管理
- 类
  - 当前类中所有的方法都交由 spring 进行事务管理 （推荐）
- 接口
  - 接口下所有的实现类当中所有的方法都交给 spring 进行事务管理

接下来，我们就可以在业务方法 delete 上加上 @Transactional 来控制事务 。

```java
@Transactional
@Override
public void save(Emp emp) {
		//1.补全基础属性
		emp.setCreateTime(LocalDateTime.now());
		emp.setUpdateTime(LocalDateTime.now());
		//2.保存员工基本信息
		empMapper.insert(emp);

		int i = 1/0;

		//3. 保存员工的工作经历信息 - 批量
		Integer empId = emp.getId();
		List<EmpExpr> exprList = emp.getExprList();
		if(!CollectionUtils.isEmpty(exprList)){
				exprList.forEach(empExpr -> empExpr.setEmpId(empId));
				empExprMapper.insertBatch(exprList);
		}
}
```

说明：可以在`application.properties`配置文件中开启事务管理日志，这样就可以在控制看到和事务相关的日志信息了

```yaml
#spring事务管理日志
logging.level.org.springframework.jdbc.support.JdbcTransactionManager = debug
```

在业务功能上添加@Transactional 注解进行事务管理后，我们重启 SpringBoot 服务，使用 Apifox 测试：

![image-20231203183834341](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203183834341.png)

添加 Spring 事务管理后，由于服务端程序引发了异常，所以事务进行回滚。

![image-20231203183929282](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203183929282.png)

打开数据库，我们会看到 `emp` 表 与 `emp_expr` 表中都没有对应的数据信息，保证了数据的一致性、完整性。

#### 2.4.2 事务进阶

前面我们通过 spring 事务管理注解@Transactional 已经控制了业务层方法的事务。接下来我们要来详细的介绍一下@Transactional 事务管理注解的使用细节。我们这里主要介绍@Transactional 注解当中的两个常见的属性：

1. 异常回滚的属性：`rollbackFor `
2. 事务传播行为：`propagation`

我们先来学习下 rollbackFor 属性。

##### 2.4.2.1 rollbackFor

我们在之前编写的业务方法上添加了@Transactional 注解，来实现事务管理。

```java
@Transactional
@Override
public void save(Emp emp) {
		//1.补全基础属性
		emp.setCreateTime(LocalDateTime.now());
		emp.setUpdateTime(LocalDateTime.now());
		//2.保存员工基本信息
		empMapper.insert(emp);

		int i = 1/0;

		//3. 保存员工的工作经历信息 - 批量
		Integer empId = emp.getId();
		List<EmpExpr> exprList = emp.getExprList();
		if(!CollectionUtils.isEmpty(exprList)){
				exprList.forEach(empExpr -> empExpr.setEmpId(empId));
				empExprMapper.insertBatch(exprList);
		}
}
```

以上业务功能 save 方法在运行时，会引发除 0 的算术运算异常(运行时异常)，出现异常之后，由于我们在方法上加了@Transactional 注解进行事务管理，所以发生异常会执行 rollback 回滚操作，从而保证事务操作前后数据是一致的。

下面我们在做一个测试，我们修改业务功能代码，在模拟异常的位置上直接抛出 Exception 异常（编译时异常）

```java
@Transactional
@Override
public void save(Emp emp) {
		//1.补全基础属性
		emp.setCreateTime(LocalDateTime.now());
		emp.setUpdateTime(LocalDateTime.now());
		//2.保存员工基本信息
		empMapper.insert(emp);

		//模拟：异常发生
		if(true){
				throw new Exception("出现异常了~~~");
		}

		//3. 保存员工的工作经历信息 - 批量
		Integer empId = emp.getId();
		List<EmpExpr> exprList = emp.getExprList();
		if(!CollectionUtils.isEmpty(exprList)){
				exprList.forEach(empExpr -> empExpr.setEmpId(empId));
				empExprMapper.insertBatch(exprList);
		}
}
```

> 说明：在 service 中向上抛出一个 Exception 编译时异常之后，由于是 controller 调用 service，所以在 controller 中要有异常处理代码，此时我们选择在 controller 中继续把异常向上抛。

重新启动服务后，打开 Apifox 进行测试，请求添加员工的接口：

![image-20231203184536831](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203184536831.png)

通过 Apifox 返回的结果，我们看到抛出异常了。然后我们在回到 IDEA 的控制台来看一下。

![image-20231203184739398](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203184739398.png)

我们看到数据库的事务居然提交了，并没有进行回滚。

通过以上测试可以得出一个结论：**默认情况下，只有出现 RuntimeException(运行时异常)才会回滚事务。**

假如我们想让所有的异常都回滚，需要来配置@Transactional 注解当中的 rollbackFor 属性，通过 rollbackFor 这个属性可以指定出现何种异常类型回滚事务。

```java
@Transactional(rollbackFor = Exception.class)
@Override
public void save(Emp emp) throws Exception {
		//1.补全基础属性
		emp.setCreateTime(LocalDateTime.now());
		emp.setUpdateTime(LocalDateTime.now());
		//2.保存员工基本信息
		empMapper.insert(emp);

		//int i = 1/0;
		if(true){
				throw new Exception("出异常啦....");
		}

		//3. 保存员工的工作经历信息 - 批量
		Integer empId = emp.getId();
		List<EmpExpr> exprList = emp.getExprList();
		if(!CollectionUtils.isEmpty(exprList)){
				exprList.forEach(empExpr -> empExpr.setEmpId(empId));
				empExprMapper.insertBatch(exprList);
		}
}
```

接下来我们重新启动服务，测试新增员工的操作：

![image-20231203184536831](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203184536831.png)

控制台日志，可以看到因为出现了异常又进行了事务回滚

![image-20231203185243709](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203185243709.png)

> 结论：
>
> - 在 Spring 的事务管理中，默认只有运行时异常 RuntimeException 才会回滚。
> - 如果还需要回滚指定类型的异常，可以通过 rollbackFor 属性来指定。

##### 2.4.2.2 propagation

###### 2.4.2.2.1 介绍

我们接着继续学习@Transactional 注解当中的第二个属性 propagation，这个属性是用来配置事务的传播行为的。

什么是事务的传播行为呢？

- 就是当一个事务方法被另一个事务方法调用时，这个事务方法应该如何进行事务控制。

例如：两个事务方法，一个 A 方法，一个 B 方法。在这两个方法上都添加了@Transactional 注解，就代表这两个方法都具有事务，而在 A 方法当中又去调用了 B 方法。

![image-20231203185456829](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203185456829.png)

所谓事务的传播行为，指的就是在 A 方法运行的时候，首先会开启一个事务，在 A 方法当中又调用了 B 方法， B 方法自身也具有事务，那么 B 方法在运行的时候，到底是加入到 A 方法的事务当中来，还是 B 方法在运行的时候新建一个事务？这个就涉及到了事务的传播行为。

我们要想控制事务的传播行为，在@Transactional 注解的后面指定一个属性 propagation，通过 propagation 属性来指定传播行为。接下来我们就来介绍一下常见的事务传播行为。

| **属性值**    | **含义**                                                           |
| ------------- | ------------------------------------------------------------------ |
| REQUIRED      | 【默认值】需要事务，有则加入，无则创建新事务                       |
| REQUIRES_NEW  | 需要新事务，无论有无，总是创建新事务                               |
| SUPPORTS      | 支持事务，有则加入，无则在无事务状态中运行                         |
| NOT_SUPPORTED | 不支持事务，在无事务状态下运行,如果当前存在已有事务,则挂起当前事务 |
| MANDATORY     | 必须有事务，否则抛异常                                             |
| NEVER         | 必须没事务，否则抛异常                                             |
| …             |                                                                    |

> 对于这些事务传播行为，我们只需要关注以下两个就可以了：
>
> 1. REQUIRED（默认值）
> 2. REQUIRES_NEW

###### 2.4.2.2.2 案例

接下来我们就通过一个案例来演示下事务传播行为 propagation 属性的使用。

**需求：** 在新增员工信息时，无论是成功还是失败，都要记录操作日志。

**步骤：**

1. 准备日志表 emp_log、实体类 EmpLog、Mapper 接口 EmpLogMapper
2. 在新增员工时记录日志

**准备工作：**

1). 创建数据库表 `emp_log` 日志表：

```sql
-- 创建员工日志表
create table emp_log(
		id int unsigned primary key auto_increment comment 'ID, 主键',
		operate_time datetime comment '操作时间',
		info varchar(2000) comment '日志信息'
) comment '员工日志表';
```

2). 引入资料中提供的实体类：EmpLog

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmpLog {
		private Integer id; //ID
		private LocalDateTime operateTime; //操作时间
		private String info; //详细信息
}

```

3). 引入资料中提供的 Mapper 接口：EmpLogMapper

```java
@Mapper
public interface EmpLogMapper {
	//插入日志
		@Insert("insert into emp_log (operate_time, info) values (#{operateTime}, #{info})")
		public void insert(EmpLog empLog);
}
```

4). 引入资料中提供的业务接口：EmpLogService

```java
public interface EmpLogService {
	//记录新增员工日志
		public void insertLog(EmpLog empLog);
}
```

5). 引入资料中提供的业务实现类：EmpLogServiceImpl

```java
@Service
public class EmpLogServiceImpl implements EmpLogService {

		@Autowired
		private EmpLogMapper empLogMapper;

		@Transactional
		@Override
		public void insertLog(EmpLog empLog) {
				empLogMapper.insert(empLog);
		}
}
```

**代码实现:**

业务实现类：EmpServiceImpl

```java
@Autowired
private EmpMapper empMapper;
@Autowired
private EmpExprMapper empExprMapper;
@Autowired
private EmpLogService empLogService;

@Transactional(rollbackFor = {Exception.class})
@Override
public void save(Emp emp) {
		try {
				//1.补全基础属性
				emp.setCreateTime(LocalDateTime.now());
				emp.setUpdateTime(LocalDateTime.now());

				//2.保存员工基本信息
				empMapper.insert(emp);

				int i = 1/0;

				//3. 保存员工的工作经历信息 - 批量
				Integer empId = emp.getId();
				List<EmpExpr> exprList = emp.getExprList();
				if(!CollectionUtils.isEmpty(exprList)){
						exprList.forEach(empExpr -> empExpr.setEmpId(empId));
						empExprMapper.insertBatch(exprList);
				}
		} finally {
				//记录操作日志
				EmpLog empLog = new EmpLog(null, LocalDateTime.now(), emp.toString());
				empLogService.insertLog(empLog);
		}

}
```

**测试:**

重新启动 SpringBoot 服务，测试新增员工操作 。我们可以看到控制台中输出的日志：

![image-20231203191055521](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203191055521.png)

- 执行了插入员工数据的操作
- 执行了插入日志操作
- 程序发生 Exception 异常
- 执行事务回滚（保存员工数据、插入操作日志 因为在一个事务范围内，两个操作都会被回滚）

然后在 `emp_log` 表中没有记录日志数据

![image-20231203191153984](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203191153984.png)

**原因分析:**

接下来我们就需要来分析一下具体是什么原因导致的日志没有成功的记录。

- 在执行 `save` 方法时开启了一个事务

- 当执行 `empLogService.insertLog` 操作时，`insertLog`设置的事务传播行是默认值 REQUIRED，表示有事务就加入，没有则新建事务

- 此时：` save` 和 `insertLog` 操作使用了同一个事务，同一个事务中的多个操作，要么同时成功，要么同时失败，所以当异常发生时进行事务回滚，就会回滚 `save` 和 `insertLog` 操作

**解决方案：**

在`EmpLogServiceImpl`类中 insertLog 方法上，添加 @Transactional(propagation = Propagation.REQUIRES_NEW)

> Propagation.REQUIRES_NEW ：不论是否有事务，都创建新事务 ，运行在一个独立的事务中。

```java
@Service
public class EmpLogServiceImpl implements EmpLogService {

		@Autowired
		private EmpLogMapper empLogMapper;

		@Transactional(propagation = Propagation.REQUIRES_NEW)
		@Override
		public void insertLog(EmpLog empLog) {
				empLogMapper.insert(empLog);
		}
}
```

重启 SpringBoot 服务，再次测试 新增员工的操作 ，会看到具体的日志如下：

![image-20231203191945758](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203191945758.png)

那此时，`EmpServiceImpl` 中的 `save` 方法运行时，会开启一个事务。 当调用 `empLogService.insertLog(empLog)` 时，也会创建一个新的事务，那此时，当 `insertLog` 方法运行完毕之后，事务就已经提交了。 即使外部的事务出现异常，内部已经提交的事务，也不会回滚了，因为是两个独立的事务。

到此事务传播行为已演示完成，事务的传播行为我们只需要掌握两个：REQUIRED、REQUIRES_NEW。

> - REQUIRED ：大部分情况下都是用该传播行为即可。
>
> - REQUIRES_NEW ：当我们不希望事务之间相互影响时，可以使用该传播行为。比如：下订单前需要记录日志，不论订单保存成功与否，都需要保证日志记录能够记录成功。

### 2.5 事务四大特性

面试题：事务有哪些特性？

- 原子性（Atomicity）：事务是不可分割的最小单元，要么全部成功，要么全部失败。
- 一致性（Consistency）：事务完成时，必须使所有的数据都保持一致状态。
- 隔离性（Isolation）：数据库系统提供的隔离机制，保证事务在不受外部并发操作影响的独立环境下运行。
- 持久性（Durability）：事务一旦提交或回滚，它对数据库中的数据的改变就是永久的。

> 事务的四大特性简称为：ACID

- **原子性（Atomicity）** ：原子性是指事务包装的一组 sql 是一个不可分割的工作单元，事务中的操作要么全部成功，要么全部失败。

- **一致性（Consistency）**：一个事务完成之后数据都必须处于一致性状态。

  - 如果事务成功的完成，那么数据库的所有变化将生效。
  - 如果事务执行出现错误，那么数据库的所有变化将会被回滚(撤销)，返回到原始状态。

- **隔离性（Isolation）**：多个用户并发的访问数据库时，一个用户的事务不能被其他用户的事务干扰，多个并发的事务之间要相互隔离。

  - 一个事务的成功或者失败对于其他的事务是没有影响。

- **持久性（Durability）**：一个事务一旦被提交或回滚，它对数据库的改变将是永久性的，哪怕数据库发生异常，重启之后数据亦然存在。

## 3. 文件上传

在我们完成的 新增员工 功能中，还存在一个问题：没有头像(图片缺失)

<img src="/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203200638065.png" alt="image-20231203200638065" style="zoom:67%;" />

上述问题，需要我们通过文件上传技术来解决。下面我们就进入到文件上传技术的学习。

文件上传技术这块我们主要讲解三个方面：首先我们先对文件上传做一个整体的介绍，接着再学习文件上传的本地存储方式，最后学习云存储方式。

接下来我们就先来学习下什么是文件上传。

### 3.1 简介

文件上传，是指将本地图片、视频、音频等文件上传到服务器，供其他用户浏览或下载的过程。

文件上传在项目中应用非常广泛，我们经常发微博、发微信朋友圈都用到了文件上传功能。

<img src="/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203200829171.png" alt="image-20231203200829171" style="zoom:80%;" />

> 在我们的案例中，在新增员工的时候，要上传员工的头像，此时就会涉及到文件上传的功能。在进行文件上传时，我们点击加号或者是点击图片，就可以选择手机或者是电脑本地的图片文件了。当我们选择了某一个图片文件之后，这个文件就会上传到服务器，从而完成文件上传的操作。

想要完成文件上传这个功能需要涉及到两个部分：

1. 前端程序
2. 服务端程序

我们先来看看在前端程序中要完成哪些代码：

```html
<form action="/upload" method="post" enctype="multipart/form-data">
  姓名: <input type="text" name="username" /><br />
  年龄: <input type="text" name="age" /><br />
  头像: <input type="file" name="file" /><br />
  <input type="submit" value="提交" />
</form>
```

<img src="/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203200946291.png" alt="image-20231203200946291" style="zoom:80%;" />

上传文件的原始 form 表单，要求表单必须具备以下三点（上传文件页面三要素）：

- 表单必须有 file 域，用于选择要上传的文件

  > ```html
  > <input type="file" name="file" />
  > ```

- 表单提交方式必须为 POST

  > 通常上传的文件会比较大，所以需要使用 POST 提交方式

- 表单的编码类型 enctype 必须要设置为：multipart/form-data

  > 普通默认的编码格式是不适合传输大型的二进制数据的，所以在文件上传时，表单的编码格式必须设置为 multipart/form-data

前端页面的 3 要素我们了解后，接下来我们就来验证下所讲解的文件上传 3 要素。

在提供的"课程资料"中有一个名叫"文件上传"的文件夹，直接将里的"upload.html"文件，复制到 springboot 项目工程下的 static 目录里面。

![image-20231203201105071](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203201105071.png)

下面我们来验证：删除 form 表单中 `enctype` 属性值，会是什么情况？

1). 在 IDEA 中直接使用浏览器打开 upload.html 页面

![image-20231203201128257](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203201128257.png)

2). 选择要上传的本地文件

![image-20231203201147197](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203201147197.png)

3). 点击"提交"按钮，进入到开发者模式观察

![image-20231203201208117](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203201208117.png)

![image-20231203201224027](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203201224027.png)

我们再来验证：设置 form 表单中 enctype 属性值为 `multipart/form-data`，会是什么情况？

```html
<form action="/upload" method="post" enctype="multipart/form-data">
  姓名: <input type="text" name="username" /><br />
  年龄: <input type="text" name="age" /><br />
  头像: <input type="file" name="file" /><br />
  <input type="submit" value="提交" />
</form>
```

![image-20231203201310392](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203201310392.png)

![image-20231203201326218](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203201326218.png)

知道了前端程序中需要设置上传文件页面三要素，那我们的后端程序又是如何实现的呢？

- 首先在服务端定义这么一个 controller，用来进行文件上传，然后在 controller 当中定义一个方法来处理`/upload` 请求

- 在定义的方法中接收提交过来的数据 （方法中的形参名和请求参数的名字保持一致）

  - 用户名：String name
  - 年龄： Integer age
  - 文件： MultipartFile file

  > Spring 中提供了一个 API：MultipartFile，使用这个 API 就可以来接收到上传的文件

<img src="/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203201417856.png" alt="image-20231203201417856" style="zoom:80%;" />

> 问题：如果表单项的名字和方法中形参名不一致，该怎么办？
>
> - ```javascript
>   public Result upload(String username,
>                        Integer age,
>                        MultipartFile image) //image形参名和请求参数名file不一致
>   ```
>
> 解决：使用@RequestParam 注解进行参数绑定
>
> - ```java
>   public Result upload(String username,
>                        Integer age,
>                        @RequestParam("file") MultipartFile image)
>   ```

**UploadController 代码：**

```java
@Slf4j
@RestController
public class UploadController {

		@PostMapping("/upload")
		public Result upload(String username, Integer age, MultipartFile file)  {
				log.info("文件上传：{},{},{}",username,age,file);
				return Result.success();
		}

}
```

后端程序编写完成之后，打个断点，以 debug 方式启动 SpringBoot 项目

打开浏览器输入：http://localhost:8080/upload.html ， 录入数据并提交

![image-20231203201525074](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203201525074.png)

通过后端程序控制台可以看到，上传的文件是存放在一个临时目录

![image-20231203201539826](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203201539826.png)

打开临时目录可以看到以下内容：

![image-20231203201555919](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203201555919.png)

表单提交的三项数据(姓名、年龄、文件)，分别存储在不同的临时文件中：

![image-20231203201614000](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203201614000.png)

> 当我们程序运行完毕之后，这个临时文件会自动删除。
>
> 所以，我们如果想要实现文件上传，需要将这个临时文件，要转存到我们的磁盘目录中。

### 3.2 本地存储

前面我们已分析了文件上传功能前端和后端的基础代码实现，文件上传时在服务端会产生一个临时文件，请求响应完成之后，这个临时文件被自动删除，并没有进行保存。下面呢，我们就需要完成将上传的文件保存在服务器的本地磁盘上。

代码实现：

1. 在服务器本地磁盘上创建 images 目录，用来存储上传的文件（例：E 盘创建 images 目录）
2. 使用 MultipartFile 类提供的 API 方法，把临时文件转存到本地磁盘目录下

> MultipartFile 常见方法：
>
> - String getOriginalFilename(); //获取原始文件名
> - void transferTo(File dest); //将接收的文件转存到磁盘文件中
> - long getSize(); //获取文件的大小，单位：字节
> - byte[] getBytes(); //获取文件内容的字节数组
> - InputStream getInputStream(); //获取接收到的文件内容的输入流

```java
@RestController
public class UploadController {
		@PostMapping("/upload")
		public Result upload(MultipartFile file) throws IOException {
				//获取原始文件名
				String originalFilename = file.getOriginalFilename();
				//构建新的文件名
				String newFileName = UUID.randomUUID().toString()+originalFilename.substring(originalFilename.lastIndexOf("."));
				//将文件保存在服务器端 D:/images/ 目录下
				file.transferTo(new File("D:/images/"+newFileName));
				return Result.success();
		}
}
```

利用 `Apifox` 测试：

注意：请求参数名和 controller 方法形参名保持一致

![image-20231203202449019](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203202449019.png)

通过 `Apifox` 测试，我们发现文件上传是没有问题的。

在解决了文件名唯一性的问题后，我们再次上传一个较大的文件(超出 1M)时发现，后端程序报错：

![image-20231203203317543](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203203317543.png)

报错原因呢，是因为：在 SpringBoot 中，文件上传时默认单个文件最大大小为 1M

那么如果需要上传大文件，可以在 `application.properties` 进行如下配置：

```properties
#配置单个文件最大上传大小
spring.servlet.multipart.max-file-size=10MB

#配置单个请求最大上传大小(一次请求可以上传多个文件)
spring.servlet.multipart.max-request-size=100MB
```

到时此，我们文件上传的本地存储方式已完成了。但是这种本地存储方式还存在一问题：

<img src="/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203203412212.png" alt="image-20231203203412212" style="zoom: 67%;" />

如果直接存储在服务器的磁盘目录中，存在以下缺点：

- 不安全：磁盘如果损坏，所有的文件就会丢失
- 容量有限：如果存储大量的图片，磁盘空间有限(磁盘不可能无限制扩容)
- 无法直接访问

为了解决上述问题呢，通常有两种解决方案：

- 自己搭建存储服务器，如：fastDFS 、MinIO
- 使用现成的云服务，如：阿里云，腾讯云，华为云

### 3.3 阿里云 OSS

#### 3.3.1 准备

阿里云是阿里巴巴集团旗下全球领先的云计算公司，也是国内最大的云服务提供商 。

<img src="/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203203446333.png" alt="image-20231203203446333" style="zoom: 67%;" />

> 云服务指的就是通过互联网对外提供的各种各样的服务，比如像：语音服务、短信服务、邮件服务、视频直播服务、文字识别服务、对象存储服务等等。
>
> 当我们在项目开发时需要用到某个或某些服务，就不需要自己来开发了，可以直接使用阿里云提供好的这些现成服务就可以了。比如：在项目开发当中，我们要实现一个短信发送的功能，如果我们项目组自己实现，将会非常繁琐，因为你需要和各个运营商进行对接。而此时阿里云完成了和三大运营商对接，并对外提供了一个短信服务。我们项目组只需要调用阿里云提供的短信服务，就可以很方便的来发送短信了。这样就降低了我们项目的开发难度，同时也提高了项目的开发效率。（大白话：别人帮我们实现好了功能，我们只要调用即可）
>
> 云服务提供商给我们提供的软件服务通常是需要收取一部分费用的。

阿里云对象存储 OSS（Object Storage Service），是一款海量、安全、低成本、高可靠的云存储服务。使用 OSS，您可以通过网络随时存储和调用包括文本、图片、音频和视频等在内的各种文件。

![image-20231203203509617](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203203509617.png)

在我们使用了阿里云 OSS 对象存储服务之后，我们的项目当中如果涉及到文件上传这样的业务，在前端进行文件上传并请求到服务端时，在服务器本地磁盘当中就不需要再来存储文件了。我们直接将接收到的文件上传到 oss，由 oss 帮我们存储和管理，同时阿里云的 oss 存储服务还保障了我们所存储内容的安全可靠。

![image-20231203203535648](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203203535648.png)

那我们学习使用这类云服务，我们主要学习什么呢？其实我们主要学习的是如何在项目当中来使用云服务完成具体的业务功能。而无论使用什么样的云服务，阿里云也好，腾讯云、华为云也罢，在使用第三方的服务时，操作的思路都是一样的。

<img src="/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203203603114.png" alt="image-20231203203603114" style="zoom:67%;" />

> SDK：Software Development Kit 的缩写，软件开发工具包，包括辅助软件开发的依赖（jar 包）、代码示例等，都可以叫做 SDK。
>
> 简单说，sdk 中包含了我们使用第三方云服务时所需要的依赖，以及一些示例代码。我们可以参照 sdk 所提供的示例代码就可以完成入门程序。

第三方服务使用的通用思路，我们做一个简单介绍之后，接下来我们就来介绍一下我们当前要使用的阿里云 oss 对象存储服务具体的使用步骤。

![image-20231203203634852](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203203634852.png)

> Bucket：存储空间是用户用于存储对象（Object，就是文件）的容器，所有的对象都必须隶属于某个存储空间。

##### 3.3.1.1 账号准备

下面我们根据之前介绍的使用步骤，完成准备工作：

1. 注册阿里云账户（**注册完成后需要实名认证**）

   https://account.aliyun.com/login/login.htm?oauth_callback=https%3A%2F%2Fwww.aliyun.com%2F

   ![image-20231203204940906](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203204940906.png)

2. 注册完账号之后，就可以登录阿里云

​ <img src="/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203203655091.png" alt="image-20231203203655091" style="zoom:67%;" />

​

##### 3.3.1.2 开通 OSS 云服务

1). 通过控制台找到对象存储 OSS 服务

<img src="/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203205356059.png" alt="image-20231203205356059" style="zoom:67%;" />

<img src="/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203203727265.png" alt="image-20231203203727265" style="zoom:67%;" />

​ 如果是第一次访问，还需要开通对象存储服务 OSS

<img src="/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203203749688.png" alt="image-20231203203749688" style="zoom:67%;" />

​

2). 开通 OSS 服务之后，就可以进入到阿里云对象存储的控制台

<img src="/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203203957217.png" alt="image-20231203203957217" style="zoom:60%;" />

3). 点击左侧的 "Bucket 列表"，创建一个 Bucket

<img src="/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203204031109.png" alt="image-20231203204031109" style="zoom: 67%;" />

<img src="/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203204157199.png" alt="image-20231203204157199" style="zoom: 82%;" />

##### 3.3.1.3 配置 AK & SK

1). 创建 AccessKey

点击 "AccessKey 管理"，进入到管理页面。

<img src="/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203205500858.png" alt="image-20231203205500858" style="zoom:67%;" />

点击 "AccessKey"。

![image-20231203205600647](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203205600647.png)

<img src="/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203205742130.png" alt="image-20231203205742130" style="zoom:67%;" />

2). 配置 AK & SK

以**管理员身份**打开 CMD 命令行，执行如下命令，配置系统的环境变量。

```shell
set OSS_ACCESS_KEY_ID=LTAI5tXXXXXXXXXXXXXXXXXXXXM8TP
set OSS_ACCESS_KEY_SECRET=UzMcJXXXXXXXXXXXXXXXXXXXXdabTNafi
```

<span style='color:red; font-size: 25px; font-weight:800'>  注意：将上述的 ACCESS_KEY_ID  与  ACCESS_KEY_SECRET 的值一定一定一定一定一定一定要替换成自己的 。</span>

执行如下命令，让更改生效。

```shell
setx OSS_ACCESS_KEY_ID "%OSS_ACCESS_KEY_ID%"
setx OSS_ACCESS_KEY_SECRET "%OSS_ACCESS_KEY_SECRET%"
```

执行如下命令，验证环境变量是否生效。

```shell
echo %OSS_ACCESS_KEY_ID%
echo %OSS_ACCESS_KEY_SECRET%
```

#### 3.3.2 入门

阿里云 oss 对象存储服务的准备工作我们已经完成了，接下来我们就来完成第二步操作：参照官方所提供的 sdk 示例来编写入门程序。

首先我们需要来打开阿里云 OSS 的官方文档，在官方文档中找到 SDK 的示例代码：

![image-20231203204307766](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203204307766.png)

> 如果是在实际开发当中，我们是需要从前往后仔细的去阅读这一份文档的，但是由于现在是教学，我们就只挑重点的去看。有兴趣的同学大家下来也可以自己去看一下这份官方文档。

![image-20231203204415060](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203204415060.png)

![image-20231203204510698](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203204510698.png)

参照官方提供的 SDK，改造一下，即可实现文件上传功能：

```java
public class AliyunOSSTest {

		@Test
		public void testUploadFile() throws Exception {
				// Endpoint以华东1（杭州）为例，其它Region请按实际情况填写。
				String endpoint = "https://oss-cn-beijing.aliyuncs.com";
				// 从环境变量中获取访问凭证。运行本代码示例之前，请确保已设置环境变量OSS_ACCESS_KEY_ID和OSS_ACCESS_KEY_SECRET。
				EnvironmentVariableCredentialsProvider credentialsProvider = CredentialsProviderFactory.newEnvironmentVariableCredentialsProvider();
				// 填写Bucket名称，例如examplebucket。
				String bucketName = "web2024";
				// 填写Object完整路径，完整路径中不能包含Bucket名称，例如exampledir/exampleobject.txt。
				String objectName = "1.png";
				// 填写本地文件的完整路径，例如D:\\localpath\\examplefile.txt。
				// 如果未指定本地路径，则默认从示例程序所属项目对应本地路径中上传文件流。
				String filePath= "C:\\Users\\deng\\Pictures\\播仔0001.png";

				// 创建OSSClient实例。
				OSS ossClient = new OSSClientBuilder().build(endpoint, credentialsProvider);

				try {
						InputStream inputStream = new FileInputStream(filePath);
						// 创建PutObjectRequest对象。
						PutObjectRequest putObjectRequest = new PutObjectRequest(bucketName, objectName, inputStream);
						// 创建PutObject请求。
						PutObjectResult result = ossClient.putObject(putObjectRequest);
				} catch (OSSException oe) {
						System.out.println("Caught an OSSException, which means your request made it to OSS, but was rejected with an error response for some reason.");
						System.out.println("Error Message:" + oe.getErrorMessage());
						System.out.println("Error Code:" + oe.getErrorCode());
						System.out.println("Request ID:" + oe.getRequestId());
						System.out.println("Host ID:" + oe.getHostId());
				} catch (ClientException ce) {
						System.out.println("Caught an ClientException, which means the client encountered a serious internal problem while trying to communicate with OSS, such as not being able to access the network.");
						System.out.println("Error Message:" + ce.getMessage());
				} finally {
						if (ossClient != null) {
								ossClient.shutdown();
						}
				}
		}

}
```

> 在以上代码中，需要替换的内容为：
>
> - endpoint：阿里云 OSS 中的 bucket 对应的域名
>
> - bucketName：Bucket 名称
> - objectName：对象名称，在 Bucket 中存储的对象的名称
> - filePath：文件路径

运行以上程序后，会把本地的文件上传到阿里云 OSS 服务器上。

#### 3.3.3 集成

##### 3.3.3.1 介绍

阿里云 oss 对象存储服务的准备工作以及入门程序我们都已经完成了，接下来我们就需要在案例当中集成 oss 对象存储服务，来存储和管理案例中上传的图片。

![image-20231203210723408](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203210723408.png)

> 在新增员工的时候，上传员工的图像，而之所以需要上传员工的图像，是因为将来我们需要在系统页面当中访问并展示员工的图像。而要想完成这个操作，需要做两件事：
>
> 1. 需要上传员工的图像，并把图像保存起来（存储到阿里云 OSS）
> 2. 访问员工图像（通过图像在阿里云 OSS 的存储地址访问图像）
>    - OSS 中的每一个文件都会分配一个访问的 url，通过这个 url 就可以访问到存储在阿里云上的图片。所以需要把 url 返回给前端，这样前端就可以通过 url 获取到图像。

我们参照接口文档来开发文件上传功能：

- 基本信息

  ```
  请求路径：/upload

  请求方式：POST

  接口描述：上传图片接口
  ```

- 请求参数

  参数格式：multipart/form-data

  参数说明：

  | 参数名称 | 参数类型 | 是否必须 | 示例 | 备注 |
  | -------- | -------- | -------- | ---- | ---- |
  | image    | file     | 是       |      |      |

- 响应数据

  参数格式：application/json

  参数说明：

  | 参数名 | 类型   | 是否必须 | 备注                           |
  | ------ | ------ | -------- | ------------------------------ |
  | code   | number | 必须     | 响应码，1 代表成功，0 代表失败 |
  | msg    | string | 非必须   | 提示信息                       |
  | data   | object | 非必须   | 返回的数据，上传图片的访问路径 |

  响应数据样例：

  ```json
  {
    "code": 1,
    "msg": "success",
    "data": "https://web-framework.oss-cn-hangzhou.aliyuncs.com/2022-09-02-00-27-0400.jpg"
  }
  ```

##### 3.3.3.2 实现

1). 引入阿里云 OSS 上传文件工具类（由官方的示例代码改造而来）

```java
/**
 * 阿里云OSS操作工具类
 */
@Slf4j
public class AliyunOSSUtils {

		/**
		 * 上传文件
		 * @param endpoint endpoint域名
		 * @param bucketName 存储空间的名字
		 * @param content 内容字节数组
		 */
		public static String upload(String endpoint, String bucketName, byte[] content, String extName) throws Exception {
				// 从环境变量中获取访问凭证。运行本代码示例之前，请确保已设置环境变量OSS_ACCESS_KEY_ID和OSS_ACCESS_KEY_SECRET。
				EnvironmentVariableCredentialsProvider credentialsProvider = CredentialsProviderFactory.newEnvironmentVariableCredentialsProvider();
				// 填写Object完整路径，完整路径中不能包含Bucket名称，例如exampledir/exampleobject.txt。
				String objectName = UUID.randomUUID() + extName;

				// 创建OSSClient实例。
				OSS ossClient = new OSSClientBuilder().build(endpoint, credentialsProvider);
				try {
						// 创建PutObjectRequest对象。
						PutObjectRequest putObjectRequest = new PutObjectRequest(bucketName, objectName, new ByteArrayInputStream(content));
						// 创建PutObject请求。
						PutObjectResult result = ossClient.putObject(putObjectRequest);
				} catch (OSSException oe) {
						log.error("Caught an OSSException, which means your request made it to OSS, but was rejected with an error response for some reason.");
						log.error("Error Message:" + oe.getErrorMessage());
						log.error("Error Code:" + oe.getErrorCode());
						log.error("Request ID:" + oe.getRequestId());
						log.error("Host ID:" + oe.getHostId());
				} catch (ClientException ce) {
						log.error("Caught an ClientException, which means the client encountered a serious internal problem while trying to communicate with OSS, such as not being able to access the network.");
						log.error("Error Message:" + ce.getMessage());
				} finally {
						if (ossClient != null) {
								ossClient.shutdown();
						}
				}

				return endpoint.split("//")[0] + "//" + bucketName + "." + endpoint.split("//")[1] + "/" + objectName;
		}

}
```

2). 修改 UploadController 代码：

```java
@Slf4j
@RestController
public class UploadController {
		private String endpoint = "https://oss-cn-beijing.aliyuncs.com";
		private String bucketName = "java417-web";

		@PostMapping("/upload")
		public Result upload(MultipartFile file) throws Exception {
				log.info("文件上传: {}", file.getOriginalFilename());
				String extName = file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf("."));
				String url = AliyunOSSUtils.upload(endpoint, bucketName, file.getBytes(), extName);
				return Result.success(url);
		}

}
```

使用 Apifox 测试：

![image-20231203211623678](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203211623678.png)

## 4. 配置文件

员工管理的新增功能我们已开发完成，但在我们所开发的程序中还一些小问题，下面我们就来分析一下当前案例中存在的问题以及如何优化解决。

### 4.1 参数配置化

![image-20231203213607750](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203213607750.png)

在我们之前编写的程序中进行文件上传时，需要指定两个参数：

- endpoint //阿里云 OSS 域名
- bucket //存储空间的名字

关于以上的这些阿里云相关配置信息，我们是直接写死在 java 代码中了(硬编码)，如果我们在做项目时每涉及到一个第三方技术服务，就将其参数硬编码，那么在 Java 程序中会存在两个问题：

1. 如果这些参数发生变化了，就必须在源程序代码中改动这些参数，然后需要重新进行代码的编译，将 Java 代码编译成 class 字节码文件再重新运行程序。（比较繁琐）
2. 如果我们开发的是一个真实的企业级项目， Java 类可能会有很多，如果将这些参数分散的定义在各个 Java 类当中，我们要修改一个参数值，我们就需要在众多的 Java 代码当中来定位到对应的位置，再来修改参数，修改完毕之后再重新编译再运行。（参数配置过于分散，是不方便集中的管理和维护）

为了解决以上分析的问题，我们可以将参数配置在配置文件中。如下：

```properties
#自定义的阿里云OSS配置信息
aliyun.oss.endpoint=https://oss-cn-beijing.aliyuncs.com
aliyun.oss.bucketName=java417-web
```

在将阿里云 OSS 配置参数交给 properties 配置文件来管理之后，我们的 UploadController 就变为以下形式：

```java
@Slf4j
@RestController
public class UploadController {

		private String endpoint;
		private String bucketName;

		@PostMapping("/upload")
		public Result upload(MultipartFile file) throws Exception {
				log.info("文件上传: {}", file.getOriginalFilename());
				String extName = file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf("."));
				String url = AliyunOSSUtils.upload(endpoint, bucketName, file.getBytes(), extName);
				return Result.success(url);
		}

}
```

> 而此时如果直接调用 UploadController 类当中的 upload 方法进行文件上传时，这 2 项参数全部为 null，原因是因为并没有给它赋值。
>
> 此时我们是不是需要将配置文件当中所配置的属性值读取出来，并分别赋值给 UploadController 当中的各个属性呢？那应该怎么做呢？

因为 `application.properties` 是 springboot 项目默认的配置文件，所以 springboot 程序在启动时会默认读取 `application.properties` 配置文件，而我们可以使用一个现成的注解：`@Value`，获取配置文件中的数据。

`@Value` 注解通常用于外部配置的属性注入，具体用法为： `@Value("${配置文件中的key}")`

```java
@Slf4j
@RestController
public class UploadController {

		@Value("${aliyun.oss.endpoint}")
		private String endpoint;
		@Value("${aliyun.oss.bucketName}")
		private String bucketName;

		@PostMapping("/upload")
		public Result upload(MultipartFile file) throws Exception {
				log.info("文件上传: {}", file.getOriginalFilename());
				String extName = file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf("."));
				String url = AliyunOSSUtils.upload(endpoint, bucketName, file.getBytes(), extName);
				return Result.success(url);
		}

}
```

具体的加载流程如下:

![image-20231203212729315](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203212729315.png)

使用 Apifox 测试：

![image-20231203212653158](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203212653158.png)

### 4.2 yml 配置文件

前面我们一直使用 springboot 项目创建完毕后自带的 application.properties 进行属性的配置，那其实呢，在 springboot 项目当中是支持多种配置方式的，除了支持 properties 配置文件以外，还支持另外一种类型的配置文件，就是我们接下来要讲解的 yml 格式的配置文件。

- application.properties

  ```properties
  server.port=8080
  server.address=127.0.0.1
  ```

- application.yml

  ```yml
  server:
  	port: 8080
  	address: 127.0.0.1
  ```

- application.yaml

  ```yml
  server:
  	port: 8080
  	address: 127.0.0.1
  ```

> yml 格式的配置文件，后缀名有两种：
>
> - yml （推荐）
> - yaml

常见配置文件格式对比：

![image-20231203212801194](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203212801194.png)

我们可以看到配置同样的数据信息，yml 格式的数据有以下特点：

- 容易阅读
- 容易与脚本语言交互
- 以数据为核心，重数据轻格式

简单的了解过 springboot 所支持的配置文件，以及不同类型配置文件之间的优缺点之后，接下来我们就来了解下 yml 配置文件的基本语法：

- 大小写敏感
- 数值前边必须有空格，作为分隔符
- 使用缩进表示层级关系，缩进时，不允许使用 Tab 键，只能用空格（idea 中会自动将 Tab 转换为空格）
- 缩进的空格数目不重要，只要相同层级的元素左侧对齐即可
- `#`表示注释，从这个字符一直到行尾，都会被解析器忽略

​ <img src="/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203212822217.png" alt="image-20231203212822217" style="zoom:80%;" />

了解完 yml 格式配置文件的基本语法之后，接下来我们再来看下 yml 文件中常见的数据格式。在这里我们主要介绍最为常见的两类：

1. 定义对象或 Map 集合
2. 定义数组、list 或 set 集合

对象/Map 集合

```yml
user:
	name: zhangsan
	age: 18
	password: 123456
```

数组/List/Set 集合

```yml
hobby:
	- java
	- game
	- sport
```

熟悉完了 yml 文件的基本语法后，我们修改下之前案例中使用的配置文件，变更为 application.yml 配置方式：

1. 修改 application.properties 名字为：`_application.properties`（名字随便更换，只要加载不到即可）
2. 创建新的配置文件： `application.yml`

- 原有`application.properties `文件：

![image-20231203212945137](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203212945137.png)

- 新建的 `application.yml` 文件：

```yaml
#数据源配置
spring:
	datasource:
		driver-class-name: com.mysql.cj.jdbc.Driver
		url: jdbc:mysql://localhost:3306/tlias
		username: root
		password: root@1234
	#文件上传大小限制
	servlet:
		multipart:
			max-file-size: 10MB
			max-request-size: 100MB
#mybatis配置
mybatis:
	configuration:
		log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
		map-underscore-to-camel-case: true
#日志控制
logging:
	level:
		org.springframework.jdbc.support.JdbcTransactionManager: debug
#阿里云OSS配置信息
aliyun:
	oss:
		endpoint: https://oss-cn-beijing.aliyuncs.com
		bucketName: web2024
```

### 4.3 @ConfigurationProperties

讲解完了 yml 配置文件之后，最后再来介绍一个注解 `@ConfigurationProperties` 。在介绍注解之前，我们先来看一个场景，分析下代码当中可能存在的问题：

![image-20231203213714083](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203213714083.png)

我们在 `application.properties` 或者 `application.yml` 中配置了阿里云 OSS 的两项参数之后，如果 java 程序中需要这四项参数数据，我们直接通过 `@Value` 注解来进行注入。这种方式本身没有什么问题，但是如果说需要注入的属性较多(例：需要 20 多个参数数据)，我们写起来就会比较繁琐。

那么有没有一种方式可以简化这些配置参数的注入呢？答案是肯定有，在 Spring 中给我们提供了一种简化方式，可以直接将配置文件中配置项的值自动的注入到对象的属性中。

Spring 提供的简化方式套路：

1). 需要创建一个实现类，且实体类中的属性名和配置文件当中 key 的名字必须要一致

​ 比如：配置文件当中叫 endpoints，实体类当中的属性也得叫 endpoints，另外实体类当中的属性还需要提供 getter / setter 方法

2). 需要将实体类交给 Spring 的 IOC 容器管理，成为 IOC 容器当中的 bean 对象

3). 在实体类上添加`@ConfigurationProperties`注解，并通过 perfect 属性来指定配置参数项的前缀

![image-20231203213258208](/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203213258208.png)

实体类：AliyunOSSProperties

```java
@Data
@Component
@ConfigurationProperties(prefix = "aliyun.oss")
public class AliyunOSSProperties {
		private String endpoint;
		private String bucketName;
}
```

AliOSSUtils 工具类：

```java
@Slf4j
@RestController
public class UploadController {

		@Autowired
		private AliyunOSSProperties aliyunOSSProperties;
		/**
		 * 文件上传
		 */
		@PostMapping("/upload")
		public Result upload(MultipartFile file) throws Exception {
				log.info("文件上传: {}", file.getOriginalFilename());
				String extName = file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf("."));

				String endpoint = aliyunOSSProperties.getEndpoint();
				String bucketName = aliyunOSSProperties.getBucketName();
				String url = AliyunOSSUtils.upload(endpoint, bucketName, file.getBytes(), extName);
				return Result.success(url);
		}

}

```

在我们添加上注解后，会发现 idea 窗口上面出现一个红色警告：

<img src="/assets/images/Java/JavaWeb/后端Web实战(员工新增)/image-20231203213841114.png" alt="image-20231203213841114" style="zoom:80%;" />

这个警告提示是告知我们还需要引入一个依赖：

```xml
<dependency>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-configuration-processor</artifactId>
</dependency>
```

当我们在 pom.xml 文件当中配置了这项依赖之后，我们重新启动服务，大家就会看到在 properties 或者是 yml 配置文件当中，就会提示阿里云 OSS 相关的配置项。所以这项依赖它的作用就是会自动的识别被`@ConfigurationProperties`注解标识的 bean 对象。

> 刚才的红色警告，已经变成了一个灰色的提示，提示我们需要重新运行 springboot 服务

@ConfigurationProperties 注解我们已经介绍完了，接下来我们就来区分一下@ConfigurationProperties 注解以及我们前面所介绍的另外一个@Value 注解：

相同点：都是用来注入外部配置的属性的。

不同点：

- @Value 注解只能一个一个的进行外部属性的注入。

- @ConfigurationProperties 可以批量的将外部的属性配置注入到 bean 对象的属性中。

如果要注入的属性非常的多，并且还想做到复用，就可以定义这么一个 bean 对象。通过 configuration properties 批量的将外部的属性配置直接注入到 bin 对象的属性当中。在其他的类当中，我要想获取到注入进来的属性，我直接注入 bin 对象，然后调用 get 方法，就可以获取到对应的属性值了
