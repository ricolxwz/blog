---
title: 简单了解GPG
date: 2024-09-22T21:45:51+10:00
author: 麦旋风超好吃
avatar: https://cdn.jsdelivr.net/gh/sigmax0124/logo@master/favicon-avatar.jpg
authorlink: https://ricolxwz.de
cover: /img/aeed6199d8cf0e7803fe2542fd64a33b.webp
images:
  - /img/aeed6199d8cf0e7803fe2542fd64a33b.webp
categories:
  - 科技
tags:
  - GPG
  - 加密
nolastmod: true
showPrevNext: true
showTableOfContents: true
showCover: false
---

GPG, 或称GNUPG, 是一个GNU项目, 它是openPGP标准的实现.

<!--more-->

它的起源是由程序员Phil Zimmermann为了避开政府监视开发的加密软件PGP. 但是, 它是商业软件, 不能自由, 免费的使用. 所以自由软件基金会决定, 开发一个PGP的替代品, GNUPG, 这就是GPG. GPG既可以用于加密数据, 又可以用于签名, 或者两者混用也可以. 

## "公钥加密", "私钥签名/认证"

这里我们要弄清楚一个概念, 即"公钥加密, 私钥签名". "公钥加密"指的是发送者使用接受者的公钥加密消息, 只有接受者能够使用自己的私钥解密消息, 相当于接受者给你了一个加密的信道, 让你传输. "私钥签名"指的是发送者使用子集的私钥签名一段数据, 任何接受者都可以用发送者的公钥来验证签名.

"公钥加密", 如SSH, 当用户使用SSH连接服务器的时候, 客户端会发送它想使用的公钥的标识信息, 这个标识信息是公钥的一部分, 包含了公钥的类型和简短的标识符. 服务器在接收到连接请求后, 会在`authorized_keys`文件中查找公钥, 根据标识符找到后, 服务器会生成一个随机数, 也叫作挑战信息, 使用公钥对这个随机数进行加密, 并将加密后的挑战信息发给客户端, 客户端收到服务器发来的加密挑战信息后, 使用私钥解密这个挑战信息, 客户端解密完成后, 将解密结果发送回服务器, 服务器收到解密的结果后, 验证结果是否正确, 如果客户端正确解密了挑战信息, 说明客户端确实拥有对应的私钥, 从而证明了身份. 当然, 为了防止MITM, 服务器会发送自己的公钥给客户端, 然后保存在客户端的`known_hosts`文件中, 此后连接时, 客户端会检查对方发来的公钥是否和合法服务器的公钥匹配, 若对方就是初始连接时候的服务器, 则认为连接可信, 继续连接.

"私钥签名", 主要用于证明文件来自签名者. 签名者(持有私钥的人)首先对消息的数据进行哈希运算, 生成一个固定长度的消息摘要, digest, 例如使用SHA-256, MD5加密算法. 然后使用私钥对生成的哈希值进行签名, 注意, 签名的是哈希值而不是整个消息本身. 签名者将消息和签名一起发送给接受者. 接受者(持有公钥的人)首先对数据使用相同的哈希运算, 生成消息的哈希值. 然后通过公钥来解密签名者附带的签名, 解密之后, 接受者将得到签名者当初加密的原始哈希值, 接受者将自己生成的哈希值与通过签名解密得到的哈希值进行比较, 如果两个哈希值相同, 证明消息没有被篡改; 如果不同, 则说明消息在传输过程中被篡改或签名无效. 

"私钥认证", 细心的小伙伴被发现了, 有可能在发送公钥的过程中, 被MITM, 然后拿到的公钥实际上是其他发送者的公钥, 解决这个问题的方法有很多, 一般情况下会引入证书颁发机构, CA, 通过证书验证公钥的真实性. 签名者的公钥会被放入一个证书中, 这个证书由CA使用CA的私钥认证, 证书中包含签名者的公钥, 身份信息, 证书的有效期和和该证书的签名等信息. 接受者的浏览器/操作系统的受信任证书库中会预先包含CA的公钥, 接受者在接收到证书的时候, 会通过预先存好的证书库中的公钥检查证书是否合法(经过篡改), 若未经过篡改, 说明证书中包含的签名者的公钥是合法的, 然后使用签名者的公钥验证原始信息是否合法, 这就是"信任链", 信任链的顶部就是CA. 典型的例子如Https, 服务器会发送签名公钥的证书, 客户端会通过证书库验证证书的公钥是否是"受信任的根证书颁发机构"颁发的, 如果是, 则提取证书中的签名公钥, 然后验证网页是否被篡改. 在签名公钥验证完成后, 客户端和服务器会协商生成一个对称加密密钥, 用于加密后续的通信数据, 从这个时刻开始, 双方通过对称加密开始通信, 确保数据的传输是加密的, 无法被窃听或者篡改. 所以, 我们向Let's Encrypt等机构申请的是证书, 证书中**包含**了签名者的私钥对应的公钥. 总的来说, 认证的过程就是**签名/签署公钥**的过程.  

## 安装

这里我们在Archlinux上安装GPG:

```bash
sudo pacman -S gnupg
```

安装完毕后, 可以通过`gpg --help`查看命令, `gpg --version`查看版本.

## 生成密钥

生成密钥的命令主要有三个:

- `gpg --full-generate-key`
- `gpg --generate-key`
- `gpg --quick-generate-key`

其中, 后两个在算法, 密钥长度和有效期等选项的时候使用的是默认值, 而第一个则是由用户手动配置和管理的, 我们以第一个作为试验对象, 会弹出一些选项:

- 选择算法和用途, 可以选择仅用于签名/认证或者用于加密
- 密钥长度, 密钥越长越安全
- 有效期, 如果密钥只是个人使用, 并且很确定可以有效保管私钥, 可以选择第一个选项, 密钥永不过期
- 提供个人信息, 真实姓名, 电子邮件地址, 注释
- 设置一个密码保护私钥, 这个和SSH的passphrase类似

然后, 系统就会开始生成密钥, 这个时候要求你做一些随机的动作, 如敲打键盘, 移动鼠标, 读写硬盘之类的, 让随机数字生成器生成数字的熵更高. 几分钟之后, 系统就会提示密钥已经生成.

生成好后, 可以使用`gpg -k`列出所有的公钥, `gpg -K`列出所有的私钥. 可以观察, 经过上述步骤后, 我们得到一个主密钥对, 和一个子密钥对. `pub`表示主公钥, `sec`表示主私钥, `sub`表示子公钥, `ssb`表示子私钥. 主密钥对和子密钥对的功能不同, 主密钥对通常由`[SC]`标识, 子密钥对通常由`[E]`标识, 这些字母的含义如下.

|简称|全称|功能解释|
|-|-|-|
|`[C]`|Certify|认证其他的密钥, 生成证书|
|`[S]`|Sign|签名|
|`[E]`|Encrypt|加密|
|`[A]`|Authenticate|身份认证|

```bash
gpg --full-gen-key

# step 1
gpg (GnuPG) 2.2.20; Copyright (C) 2020 Free Software Foundation, Inc.
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

Please select what kind of key you want:
   (1) RSA and RSA (default)
   (2) DSA and Elgamal
   (3) DSA (sign only)
   (4) RSA (sign only)
  (14) Existing key from card
Your selection?

# step 2
RSA keys may be between 1024 and 4096 bits long.
What keysize do you want? (3072)

# step 3
Please specify how long the key should be valid.
         0 = key does not expire
      <n>  = key expires in n days
      <n>w = key expires in n weeks
      <n>m = key expires in n months
      <n>y = key expires in n years
Key is valid for? (0)  2y

# step 4
Key expires at Wed 11 Jan 2023 05:50:53 PM CST
Is this correct? (y/N) y

# step 5
GnuPG needs to construct a user ID to identify your key.
Real name:  linus
Email address: linus@outlook.com  
Comment:

# 注意了这里的邮箱, 如果你不打算使用PGP为你的Git记录认证, 这里其实是可以随便输入的, 不需要是你的邮箱, 甚至不需要是一个真实存在的邮箱, 只要接受你信息的人知道就行. 隐私泄漏问题很严重, 你一旦设置了, 并且发布到公钥服务器, 就永远删不掉了😅

# step 6
You selected this USER-ID:
    "linus <linust@outlook.com>"
Change (N)ame, (C)omment, (E)mail or (O)kay/(Q)uit? o

# step 7
┌──────────────────────────────────────────────────────┐
│ Please enter the passphrase to                       											  │
│ protect your new key                                                           │ 
│                                                      │
│ Passphrase: ________________________________________ 														 │
│                                                      │
│       <OK>                              <Cancel>     │
└──────────────────────────────────────────────────────┘

# step 8
We need to generate a lot of random bytes. It is a good idea to perform
some other action (type on the keyboard, move the mouse, utilize the
disks) during the prime generation; this gives the random number
generator a better chance to gain enough entropy.

# step 9
gpg: key 99F583599B7E31F1 marked as ultimately trusted
gpg: revocation certificate stored as '/root/.gnupg/openpgp-revocs.d/705358AB85366CAB05C0220F99F583599B7E31F1.rev'
public and secret key created and signed.

pub   rsa3072 2021-01-11 [SC]
      705358AB85366CAB05C0220F99F583599B7E31F1 # 这就是KeyID
uid                      linus <linus@outlook.com>
sub   rsa3072 2021-01-11 [E]
```

## 主密钥和子密钥

在GPG的架构中, 一般会有主密钥和子密钥之分. 为什么要有主密钥和子密钥之分? 这是因为主密钥非常重要, 别人一旦获得了主密钥的控制权, 就可以以你的名义通过主密钥签名任何文件, 或者认证新的子密钥生成其数字证书, 若你的主密钥用于认证他人的公钥, 攻击者可以使用它为不可信任的公钥认证, 这意味着在你的信任网络中的其他用户可能人为这些不可信的公钥是可靠的, 因为他们信任你的主密钥的认证, 这种情况下, 攻击者可以冒充身份, 传播不可靠的公钥. 为了实现职责分离, 会创建一个单独的子密钥, 这个子密钥对的公钥是由主密钥担保的, 即主密钥是信任链的顶端, 主密钥认证了子密钥. 若子密钥被盗, 只需要吊销子密钥, 创建新的子密钥并认证即可. 

### 生成子密钥

```bash
# step 1
gpg --edit-key linus # 或者KeyID也可以

# step 2
gpg (GnuPG) 2.2.20; Copyright (C) 2020 Free Software Foundation, Inc.
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

Secret key is available.

sec  rsa3072/99F583599B7E31F1
     created: 2021-01-11  expires: never       usage: SC
     trust: ultimate      validity: ultimate
ssb  rsa3072/6FE9C71CFED44076
     created: 2021-01-11  expires: never       usage: E
[ultimate] (1). linus <linus@outlook.com>C

# step 3  
gpg>   addkey
Please select what kind of key you want:
   (3) DSA (sign only)
   (4) RSA (sign only)
   (5) Elgamal (encrypt only)
   (6) RSA (encrypt only)
  (14) Existing key from card
Your selection? 4 # 这边只生成一个用于加密的子密钥

sec  rsa3072/99F583599B7E31F1
     created: 2021-01-11  expires: never       usage: SC
     trust: ultimate      validity: ultimate
ssb  rsa3072/6FE9C71CFED44076
     created: 2021-01-11  expires: never       usage: E
ssb  rsa3072/FDB960B857D397F6
     created: 2021-01-11  expires: never       usage: S
[ultimate] (1). linus <linus@outlook.com>

# step 4
gpg>  save
```

### 生成撤销证书

加入你忘记了主密钥的密码, 或者丢失了对主密钥的控制权, 如果没有撤销凭据的话, 除了一个个通知你的朋友们没有任何办法证明你已经不适用这个密钥, 这是灾难. 

```bash
# step 1
gpg --gen-revoke -ao revoke.pgp linus # 或者KeyID也可以
# 这里的ao是armor和output的组合, armor表示将输出结果转换为ASCII编码的文本格式, output表示要输出的文件路径

# step 2
sec  rsa3072/99F583599B7E31F1 2021-01-11 linus <linus@outlook.com>

Create a revocation certificate for this key? (y/N) y
Please select the reason for the revocation:
  0 = No reason specified
  1 = Key has been compromised
  2 = Key is superseded
  3 = Key is no longer used
  Q = Cancel
(Probably you want to select 1 here) 3
```

生成的`revoke.pgp`就是撤销凭证, 有了这个撤销凭证, 可以在没有密码的情况下使一个公钥失效.

## 列出密钥

```bash
gpg --list-keys # 列出所有的公钥, 子公钥
gpg --list-secret-keys # 列出所有的私钥、子私钥
gpg -k # 列出所有的公钥, 子公钥的简写
gpg -K # 列出所有的私钥、子私钥的简写
```

默认不会输出子密钥的id, 而且没有指纹信息, 比较不安全, 所以在查看密钥的时候应该加上`--keyid-format long`输出长id, 加上`--fingerprint`输出指纹信息. 或者编辑GPG配置文件`~/.gnupg/gpg.conf`, 添加:

```txt
keyid-format 0xlong
with-fingerprint
```


## 备份

注意这里最后要带上"!", 不然会导出全部子密钥.

```bash
gpg -ao public-key.txt --export linus # 导出公钥
gpg  -ao secret-key --export-secret-key 99F583599B7E31F1!	# 导出主私钥 
gpg  -ao sign-subkey --export-secret-subkeys FDB960B857D397F6! #导出子私钥
# 别忘了同时将你刚刚生成的撤销凭证也备份起来
```

## 删除

```bash
gpg --delete-secret-keys linus # 删除私钥
gpg --delete-keys linus # 删除公钥
# 如果想全部删除推荐直接删文件夹, 即删除 $HOME/.gnupg
```

## 导入

```bash
gpg --import [密钥文件] # 从文件导入公钥或者私钥

# 输出
sec#   rsa3072/0x99F583599B7E31F1 2021-01-11 [SC]	# sec后面带有#号说明主密钥未导入, 是安全的, 主密钥被存储在其他的设备上 
      Key fingerprint = 7053 58AB 8536 6CAB 05C0  220F 99F5 8359 9B7E 31F1 # 指纹信息
uid                   [unknown] linus <linus@outlook.com>
ssb    rsa3072/0x6FE9C71CFED44076 2021-01-11 [E]

# 若导入的是私钥, 需要手动设置信任级别
gpg --edit-key your-key-id
# 在gpg> 提示符后面输入trust, 然后选择一个合适的信任级别, 通常是5, 表示绝对信任
```

## 加密

假设Alice约Bobby吃火锅, 为了防止信息窃听, 两者使用加密通信.

1. 双方交换公钥
2. Alice使用Bobby的公钥将明文"Bobby, 下午三点一起吃火锅, 怎么样"加密, 发送给Bobby
3. Bobby使用自己的私钥解密, 将密文还原为明文
4. Bobby使用Alice的公钥将明文"Ok!"加密, 发送给Alice
5. Alice使用自己的私钥解密, 将密文还原为明文

```bash
# step 1: bobby导出bobby的公钥
gpg --output bobby.asc --armor --export bobby # 或者输出二进制文件: gpg --output bobby.gpg --export bobby
# step 2: alice导入bobby的公钥
gpg --import bobby.asc
# step 3: alice认证bobby的公钥, 虽然也可以直接设置信任等级, 但是使用自己的私钥认证别人的公钥是推荐的做法
gpg --edit-key bobby
gpg > fpr # alice打电话向bobby确认指纹是否一致
gpg > sign # alice使用自己的私钥签名
gpg > save
# step 4: bobby也重复相应的步骤
# step 5: alice生成明文文件
echo "bobby, 下午三点一起吃火锅, 怎么样?" > msg
# step 6: alice生成二进制加密文件
gpg --output msg.gpg --encrypt --recipient bobby msg # 生成二进制加密文件
gpg --output msg.acc --armor --encrypt --recipient bobby msg # 生成文本加密文件
gpg -o msg.gpg -er bobby msg # 简化命令
gpg -o msg.asc --ear bobby msg # 简化命令
# step 7: bobby解密alice的加密文件
gpg --decrypt msg.gpg
gpg -d msg.gpg # 简化命令
gpg --output msg.txt --decrypt msg.gpg # 输出到文件msg.txt
# step 8: bobby也可以通过上述步骤传输密文
```

## Cache

GnuPG生成的密钥都有一个密码, Passphrase, 这个Passphrase是不用每次都输入的, 可以设置缓存时间.

### POSIX

编辑`~/.gnupg/gpg-agent.conf`文件, 添加新行.

```txt
default-cache-ttl 86400
max-cache-ttl 86400
```

其中:

- `default-cache-ttl`: 这个定义的是不活动一段时间后仍然保持解锁的时间
- `max-cache-ttl`: 这个定义的是即使密钥在一段时间内保持活动, 达到这个事件后也会强制要求输入密码

然后, 重启agent: `gpgconf --kill gpg-agent`.

### Windows

打开Kleopatra - 设置 - GnuPG系统 - Private Keys, 设置:

- Expire cached PINs after N seconds: 86400
- Set maximum PIN cache lifetime to N seconds: 86400

## 签名

还是上面那个例子.

1. 双方互换公钥
2. Alice使用自己的私钥对文件进行签名, 发送给Bobby
3. Bobby使用ALice的公钥验证Alice的签名, 提取文件

### 数据签名

```bash
# step 1: alice生成明文文件
echo "Hello world, alice signature" > doc
# step 2: alice对文件签名, 签名的时候会压缩文档
gpg --output doc.sig --sign doc # 生成二进制签名 
gpg --output doc.asc --clearsign doc # 生成ASCII纯文本签名
gpg --output doc.sig --detach-sign doc # 创建分离的签名, 常用
# step 3: bobby检查签名并提取文档
gpg --output doc-from-alice --decrypt doc.sig
gpg --decrypt doc.asc
gpg --verify doc.sig doc
```

### 公钥认证

```bash
# step 1: 获取公钥
gpg --recv-keys recipient@example.com
# step 2: 核实公钥
gpg --fingerprint recipient@example.com
# step 3: 认证公钥
gpg --sign-key recipient@example.com
gpg --lsign-key recipient@example.com # 本地认证不会发布, 只用于本地
# step 4: 分发认证的公钥
gpg --send-keys recipient@example.com
```

建议外部的公钥不要直接设置信任等级, 而是通过自己私钥认证. 因为直接设置信任等级(`gpg --edit-key recipient@example.com`然后选择`trust`)会将该密钥的拥有者视为"可信任中介人", 表示你相信他们能够正确认证别人的公钥, 可能会影响你的信任链. 认证他人的公钥表示你信任该公钥确实属于他人, 但是这并不意味着你信任他人去认证其他的公钥, 这种方式更为谨慎.

## Git签名

1. 导出用于验证签名的公钥: `gpg -a --export [KEYID]`
2. 在Github中添加公钥
3. 修改git配置: `git config --global user.signingkey [KEYID]`
4. 对提交进行签名: `git commit -S -m "you commit message"`
5. 配置自动签名: `git config commit.gpgsign true`
6. 引入Github公钥: Github网页端操作, 比如新建仓库, 提交等在本地无法验证这些签名, 这是因为网页端操作使用签名为Github平台自身的签名, `curl https://github.com/web-flow.gpg | gpg --import`
2. 认证Github公钥: `gpg --lsign-key GitHub`, 也可以直接设置Github公钥的信任等级, 但不推荐

### 解决macOS下无法输入密码问题

需要安装pinetry, 是用于GnuPG的密码输入对话框.

```bash
brew install pinentry-mac
echo "pinentry-program $(which pinentry-mac)" >> ~/.gnupg/gpg-agent.conf
gpgconf --kill gpg-agent
```

### 解决Windows下找不到GPG问题

首先确保安装Gpg4win, 然后引导git找到正确的可执行文件位置.

```powershell
git config --global gpg.program "c:/Program Files (x86)/GnuPG/bin/gpg.exe"
```

### 解决Windows下无法输入密码问题

确保Kleopatra已经在运行, 编辑`C:\Users\wenzexu\appdata\local\gnupg\gpg.conf`文件.

```powershell
pinentry-mode loopback
```

## 信任网

在使用GPG的时候, 确认自己得到的公钥是否属于正确的人非常重要, 因为公钥可能会通过MITM被替换. 为了证明公钥确实属于某个人, 常规的做法是引入CA机构, 由CA机构担保公钥的合法性, 类似于Https证书的机制. 然而GPG并没有采取这种机制, 而是采取了一种叫做信任网的方法, 它是一种去中心化的, 分布式的信任模型, 用户可以基于以下的方式构建对公钥的信任:

- 直接信任: 你自己验证某个公钥并确认它属于某个人, 常见的作法是面对面交换公钥, 或者通过其他可靠的渠道核实身份
- 间接信任: 类似于CA机构, 你选择相信某个某个公钥确实属于中介人, 当这个中介人用它的私钥对其他人的公钥进行认证的时候, 表示它已经核实了这个其他人的公钥的合法性

发布公钥的方式有很多, 可以在Notion或者印象笔记等可以共享笔记的地方, 贴出你的公钥, 或者在代码仓库或者Gist, 个人网站或者社交软件中发布你的公钥, 或者直接当面交换, 邮件发送...

### KeyServer

一个比较被普遍接受的方法是上传到KeyServer, 这是一个专门用于收集和分发公钥的服务器, 用户将自己的公钥上传到服务器, 其他人在服务器上搜索UID或者KeyID, 就可以快速得到发布者的公钥. SKS Keyserver Pool是当今世界上最大的KeyServer池, 符合它的标准的世界各地的分布式公钥服务器会定期相互通信, 同步, 比较目录, 数据完全开放下载, 现在一般说起KeyServer说的就是这个.

#### 滥用

按照官方推荐, UID是唯一的, 是用来存储用户信息的, 应该在里面填上你自己的名字和邮箱, 一个GPG账号后可以有若干个UID, 而其实这个UID是没有任何强制限制的, 也就是说你可以在UID放入任何的东西, 例如磁力链接, 编码后的图像, 音频或者视频, 让你上传到KeyServer的时候, UID限制为2k个字符, 有人甚至写了个基于KeyServer存文件的项目.

#### 碰撞

KeyID是从密钥的指纹中提取出来的简化标识符, 用来快速查找和识别密钥, 要注意的是, KeyID可能发生"碰撞", 这是因为KeyID是一个较短的标识符, 尤其是32位KeyID, 不同的密钥可能有相同的KeyID, 32位的密钥指纹的最后32位.  有研究人员借助scallion程序, 使用了普通的GPU进行碰撞, 花了4秒钟的时间就生成了一个相同KeyID的密钥. 官方推荐公布自己的KeyID的时候, 最少应该公布64位, 防止被碰撞.

#### 投毒

公钥服务器任何人都可以上传公钥, 甚至你可以上传别人的公钥. 若别人的公钥没有被上传到服务器, 这个坑就被你占了. 你就是MITM的攻击者.

#### 认证DOS

由于在信任网体系的设计中, 当客户端收到一份未知证书的时候, 它应当从公钥服务器拉去所有为这张证书认证过的人的证书, 逐层上溯, 查看是否能够找到一张已经被用户信任的证书, 如果能的话, 就视为可信证书. 2019年6月, 有攻击者向公钥服务器提交了对两个著名网友的认证背书, 此事件中的受害者Robert J.Hansen的证书被认证了15000词, 因而任何人的GPG在尝试验证它的证书的时候, 都会拉取15000个认证, 而GPG在验证这么多认证的时候会卡住很久. 由于被攻击的两个人在GPG社区中的地位很高, 它们在GPG信任网络中处于相当核心的位置, 这意味着, 当你验证一份证书的时候, 有不小的概率会不小心拉到它们俩的证书, 然后你的GPG就会卡住. 不但它们俩的证书没法用了, 它们俩认证过的证书也面临风险, 乃至于它们俩认证多的证书所认证的证书... 而上传到KeyServer的所有东西都是不可删除的, 为了解决, GnuPG 2.2.17开始, 从KeyServer下载公钥时默认不再下载关联的公钥.

#### 爆破

有个很厉害的程序姬Yegor Timoshenko, 写了个工具SKS-Exploit, 可以将任何人的GPG公钥损坏, 变得无法导入或者污染. 另外, 还能直接让KeyServer宕机. 

> [1] UlyC. (2021, 一月 26). 2021年, 用更现代的方法使用PGP（下）. C的博客 |UlyC. https://UlyC.github.io/2021/01/26/2021%E5%B9%B4-%E7%94%A8%E6%9B%B4%E7%8E%B0%E4%BB%A3%E7%9A%84%E6%96%B9%E6%B3%95%E4%BD%BF%E7%94%A8PGP-%E4%B8%8B/
>
> [2] 加密软件 GPG 入门教程 - 杨奇的博客. (不详). 取读于 2024年9月23日, 从 https://www.yangqi.show/posts/gpg-tutorial
>
> [3] UlyC. 《2021年, 用更现代的方法使用PGP（上）》. C的博客 |UlyC, 2021年1月13日, https://UlyC.github.io/2021/01/13/2021%E5%B9%B4-%E7%94%A8%E6%9B%B4%E7%8E%B0%E4%BB%A3%E7%9A%84%E6%96%B9%E6%B3%95%E4%BD%BF%E7%94%A8PGP-%E4%B8%8A/.