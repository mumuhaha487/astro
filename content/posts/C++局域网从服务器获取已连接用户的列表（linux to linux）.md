---
title: C++局域网从服务器获取已连接用户的列表（linux to linux）
published: 2023-11-26
tags: [c++,服务器,网络协议,网络编程,websocket]
category: c/c++
image: /image/90d80481cbe84518e261f2d3ea8799d6.png
---

<!--more-->

<p id="main-toc"><strong>目录</strong></p>

<p id="-toc" style="margin-left:0px;"></p>

<p id="%E6%9C%8D%E5%8A%A1%E5%99%A8%E7%AB%AF-toc" style="margin-left:0px;"><a href="#%E6%9C%8D%E5%8A%A1%E5%99%A8%E7%AB%AF">服务器端</a></p>

<p id="%E4%BB%A3%E7%A0%81-toc" style="margin-left:40px;"><a href="#%E4%BB%A3%E7%A0%81">代码</a></p>

<p id="%E5%AE%A2%E6%88%B7%E7%AB%AF-toc" style="margin-left:0px;"><a href="#%E5%AE%A2%E6%88%B7%E7%AB%AF">客户端</a></p>

<p id="%E4%BB%A3%E7%A0%81%E8%A7%A3%E6%9E%90-toc" style="margin-left:0px;"><a href="#%E4%BB%A3%E7%A0%81%E8%A7%A3%E6%9E%90">代码解析</a></p>

<p id="%E6%9C%8D%E5%8A%A1%E5%99%A8%E7%AB%AF-toc" style="margin-left:40px;"><a href="#%E6%9C%8D%E5%8A%A1%E5%99%A8%E7%AB%AF">服务器端</a></p>

<p id="%E5%8E%9F%E7%90%86-toc" style="margin-left:80px;"><a href="#%E5%8E%9F%E7%90%86">原理</a></p>

<p id="%E9%81%87%E5%88%B0%E7%9A%84%E9%98%BB%E7%A2%8D%E4%BB%A5%E5%8F%8A%E8%A7%A3%E5%86%B3%E5%8A%9E%E6%B3%95-toc" style="margin-left:80px;"><a href="#%E9%81%87%E5%88%B0%E7%9A%84%E9%98%BB%E7%A2%8D%E4%BB%A5%E5%8F%8A%E8%A7%A3%E5%86%B3%E5%8A%9E%E6%B3%95">遇到的阻碍以及解决办法</a></p>

<p id="%E5%AE%A2%E6%88%B7%E7%AB%AF-toc" style="margin-left:40px;"><a href="#%E5%AE%A2%E6%88%B7%E7%AB%AF">客户端</a></p>

<p id="%E5%8E%9F%E7%90%86-toc" style="margin-left:80px;"><a href="#%E5%8E%9F%E7%90%86">原理</a></p>

<p id="%E9%81%87%E5%88%B0%E7%9A%84%E9%98%BB%E7%A2%8D%E4%BB%A5%E5%8F%8A%E8%A7%A3%E5%86%B3%E5%8A%9E%E6%B3%95-toc" style="margin-left:80px;"><a href="#%E9%81%87%E5%88%B0%E7%9A%84%E9%98%BB%E7%A2%8D%E4%BB%A5%E5%8F%8A%E8%A7%A3%E5%86%B3%E5%8A%9E%E6%B3%95">遇到的阻碍以及解决办法</a></p>

<p id="%E8%BF%90%E8%A1%8C%E7%BB%93%E6%9E%9C%E6%88%AA%E5%9B%BE-toc" style="margin-left:0px;"><a href="#%E8%BF%90%E8%A1%8C%E7%BB%93%E6%9E%9C%E6%88%AA%E5%9B%BE">运行结果截图</a></p>

<p id="%E6%80%BB%E7%BB%93-toc" style="margin-left:0px;"><a href="#%E6%80%BB%E7%BB%93">总结</a></p>

<hr id="hr-toc" /><p></p>

<h1 id="%E6%9C%8D%E5%8A%A1%E5%99%A8%E7%AB%AF">服务器端</h1>

<h2 id="%E4%BB%A3%E7%A0%81">代码</h2>

<pre>
<code class="language-cpp">#include &lt;sys/types.h&gt;
#include &lt;sys/socket.h&gt;
#include &lt;stdio.h&gt;
#include &lt;netinet/in.h&gt;
#include &lt;arpa/inet.h&gt;
#include &lt;unistd.h&gt;
#include &lt;string.h&gt;
#include &lt;stdlib.h&gt;
#include &lt;fcntl.h&gt;
#include &lt;sys/shm.h&gt;
#include &lt;iostream&gt;
#include &lt;thread&gt;
#include &lt;list&gt;
using namespace std;
#define PORT 8806
#define IP "127.0.0.1"
int msocket;
struct sockaddr_in servaddr;
socklen_t m_len;
list&lt;int&gt; connList;
void addPerson(){
    while(1){
        int f_socket=accept(msocket,(struct sockaddr *) &amp;servaddr,&amp;m_len);
        connList.push_back(f_socket);
        cout&lt;&lt;"玩家"&lt;&lt;f_socket&lt;&lt;":进入房间"&lt;&lt;endl;
    }
}
void sendList(int f_socket){
    for(int i=0;i&lt;=connList.size()-1;i++){
        char buf_1[1024];
        memset(buf_1,0,sizeof(buf_1));
        sprintf(buf_1,"玩家%d(在线)\n",i+3);
        send(f_socket,buf_1,sizeof(buf_1),0);
    }
}
void recv_meg(){
    struct timeval tv;
    tv.tv_sec=0;
    tv.tv_usec=0;
    list&lt;int&gt;::iterator it;
    while(true){
        for(it=connList.begin();it!=connList.end();it++){
            fd_set rds;
            FD_ZERO(&amp;rds);
            int max_fd=0;
            int reval=0;
            FD_SET(*it,&amp;rds);
            if(*it&gt;max_fd){
                max_fd=*it;
            }
            reval=select(max_fd+1,&amp;rds,NULL,NULL,&amp;tv);
            if(reval==-1){
                cout&lt;&lt;"error"&lt;&lt;endl;
            }
            else if(reval==0){
                //pass
            }
            else{
                char buf[1024];
                memset(buf,0,sizeof(buf));
                int len_1=recv(*it,buf,sizeof(buf),0);
                if(len_1&gt;0){
                    if(buf[0]=='#'){
                        sendList(*it);
                    }
                    cout&lt;&lt;"收到"&lt;&lt;*it&lt;&lt;"玩家的消息:";
                    cout&lt;&lt;buf&lt;&lt;endl;
                }
            }

        }
    }
    
}
int main(){
    msocket=socket(AF_INET,SOCK_STREAM,0);
    memset(&amp;servaddr,0,sizeof(servaddr));
    servaddr.sin_family=AF_INET;
    servaddr.sin_addr.s_addr=htonl(INADDR_ANY);
    servaddr.sin_port=htons(PORT);
    if(bind(msocket,(struct sockaddr*) &amp;servaddr,sizeof(servaddr))==-1){
        perror("bind");
        exit(1);
    }
    if(listen(msocket,20)==-1){
        perror("listen");
        exit(1);
    }
    m_len=sizeof(servaddr);
    thread thr_1(recv_meg);
    thr_1.detach();
    thread th_2(addPerson);
    th_2.detach();
    while(1){}
    return 0;
}</code></pre>

<h1 id="%E5%AE%A2%E6%88%B7%E7%AB%AF">客户端</h1>

<pre>
<code class="language-cpp">#include &lt;iostream&gt;
#include &lt;sys/socket.h&gt;
#include &lt;stdio.h&gt;
#include &lt;sys/time.h&gt;
#include &lt;netinet/in.h&gt;
#include &lt;arpa/inet.h&gt;
#include &lt;cstring&gt;
using namespace std;
#define PORT 8806
int main(){
    int socket_1;
    fd_set rds;
    FD_ZERO(&amp;rds);
    struct timeval tv;
    socket_1=socket(AF_INET,SOCK_STREAM,0);
    struct sockaddr_in servaddr;
    servaddr.sin_family=AF_INET;
    servaddr.sin_port=htons(PORT);
    servaddr.sin_addr.s_addr=inet_addr("127.0.0.1");
    if(connect(socket_1,(struct sockaddr*)&amp;servaddr,sizeof(servaddr))&lt;0){
        perror("connect");
        exit(1);
    }
    while(1){
        tv.tv_sec=10;
        tv.tv_usec=0;
        FD_ZERO(&amp;rds);
        FD_SET(0,&amp;rds);
        FD_SET(socket_1,&amp;rds);
        int max_fd=0;
        int reval=0;
        if(max_fd&lt;socket_1){
            max_fd=socket_1;
        }
        reval=select(max_fd+1,&amp;rds,NULL,NULL,&amp;tv);
        if(reval==-1){
            cout&lt;&lt;"error!"&lt;&lt;endl;
        }
        else if(reval==0){
            //pass
        }
        else{
            if(FD_ISSET(socket_1,&amp;rds)){
                char buf_2 [1024];
                int len_1=recv(socket_1,buf_2,sizeof(buf_2,0),0);
                if(len_1&gt;0){
                    cout.write(buf_2,len_1);
                }
                memset(buf_2,0,sizeof(buf_2));
            }
            if(FD_ISSET(0,&amp;rds)){
                char buf_3 [1024];
                fgets(buf_3,sizeof(buf_3),stdin);
                send(socket_1,buf_3,sizeof(buf_3),0);
                memset(buf_3,0,sizeof(buf_3));
            }
        }
    }
    return 0;
}</code></pre>

<h1 id="%E4%BB%A3%E7%A0%81%E8%A7%A3%E6%9E%90">代码解析</h1>

<h2>服务器端</h2>

<h3 id="%E5%8E%9F%E7%90%86">原理</h3>

<p>创建了一个套接字绑定端口和ip地址</p>

<p>之后创建一个线程用于接收外面的连接请求并且把生成的客户端的套接字存储到connList的链表中</p>

<p>之后用在又创建以线程用select函数来判断是否有客户端进行发送请求，如果有判断第一个首字母是否为'#'如果是那么就放回发送connList链表</p>

<h3 id="%E9%81%87%E5%88%B0%E7%9A%84%E9%98%BB%E7%A2%8D%E4%BB%A5%E5%8F%8A%E8%A7%A3%E5%86%B3%E5%8A%9E%E6%B3%95">遇到的阻碍以及解决办法</h3>

<ul><li>发送的数据的时候最好加一个\n，因为客户端没有换行，所以打印的时候就会怪怪的</li>
	<li>由于是第一次实战，开始那个大小端互相转化把我搞懵了，索性本来也就不难干脆就记下来就行了。</li>
	<li>创建的服务器套接字以及客户端生成的套接字容易搞混，用命名把它分开来了。</li>
	<li>超时时间目前服务器端来看没什么用反而会影响新客户端的连接，服务器端会遍历套接字列表，如果在等待的时候有新的连接进行请求依旧会继续堵塞（因为他一次只能select一个套接字）</li>
</ul><h2>客户端</h2>

<h3>原理</h3>

<p>客户端就只有一个主函数，同样绑定套接字之后，用select用来判断是否有输入或者接受请求，如果有输入则发送输入字节流，如果有接收请求则调用接收函数并且将其打印出来</p>

<h3>遇到的阻碍以及解决办法</h3>

<ul><li>打印输出的列表用printf函数或者用cout.write(字符串,长度)不要用cout函数会乱码——<span style="color:#ffd900;"><span style="background-color:#fe2c24;">printf函数根据格式化字符串来输出数据，而cout在默认情况下将字符串视为null-terminated字符串，即以’\0’结尾。所以，如果buf_2中的数据不是以’\0’结尾的，cout将会继续输出直到遇到’\0’为止，可能造成输出乱码。</span></span></li>
	<li>这里可以设置超时时间，因为它只是监听套接字和输入流，没有上面服务器端一样的遍历。</li>
</ul><h1 id="%E8%BF%90%E8%A1%8C%E7%BB%93%E6%9E%9C%E6%88%AA%E5%9B%BE">运行结果截图</h1>

<p><img alt="" height="1026" src="/image/90d80481cbe84518e261f2d3ea8799d6.png" width="1200" /></p>

<h1 id="%E6%80%BB%E7%BB%93">总结</h1>

<p>一个基于</p>

<p><a class="has-card" data-link-desc="文章浏览阅读8.6k次，点赞8次，收藏88次。本节通过socket实现一个简单的聊天室功能聊天室中如果有人说话，则服务器负责将内容传送给聊天室的其他人那么就需要客户端和服务端两个程序，客户端负责发送消息，服务端负责接收和转发消息客户端代码：#include &lt;sys/types.h&gt;#include &lt;sys/socket.h&gt;#include &lt;stdio.h&gt;#include &lt;netinet/in.h&gt;#include &lt;arpa/inet.h&gt;#in_std socket" data-link-icon="/image/be19846480ab44ce477585fc567aeaa0.png" data-link-title="C++入门教程（18）socket 实现简单聊天室_std socket_爱我呦呦的博客-CSDN博客" href="https://blog.csdn.net/u011416077/article/details/123593428" title="C++入门教程（18）socket 实现简单聊天室_std socket_爱我呦呦的博客-CSDN博客"><span class="link-card-box"><span class="link-title">C++入门教程（18）socket 实现简单聊天室_std socket_爱我呦呦的博客-CSDN博客</span><span class="link-desc">文章浏览阅读8.6k次，点赞8次，收藏88次。本节通过socket实现一个简单的聊天室功能聊天室中如果有人说话，则服务器负责将内容传送给聊天室的其他人那么就需要客户端和服务端两个程序，客户端负责发送消息，服务端负责接收和转发消息客户端代码：#include #include #include #include #include #in_std socket</span><span class="link-link"><img alt="" class="link-link-icon" src="/image/be19846480ab44ce477585fc567aeaa0.png" />https://blog.csdn.net/u011416077/article/details/123593428</span></span></a>的拓展功能。并且把一些不足之处给指出来了。</p>
