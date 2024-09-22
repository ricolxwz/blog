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
showPrevNext: false
showTableOfContents: false
showCover: false
---

GPG, 或称GNUPG, 是一个GNU项目, 它是openPGP标准的实现, 使用对称和/或非对称算法提供了加密, 数字签名, 身份验证和解密的功能. 

<!--more-->

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

其中, 后两个在加密算法, 密钥长度和有效期等选项的时候使用的是有效值, 而第一个则是由用户手动配置和管理的, 我们以第一个作为试验对象, 会弹出一些选项:

- 选择加密算法和用途