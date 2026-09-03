---
title: 记录PIP安装出现的一系列错误
published: 2023-04-26
tags: [pip,python,开发语言]
category: python
image: /image/3d1cc0526428e297326dca2e863db719.png
---

<!--more-->

<p>在安装pandas时运行</p>

<pre>
<code>pip install Pandas</code></pre>

<p>结果出现报错</p>

<p><img alt="" height="639" src="/image/3d1cc0526428e297326dca2e863db719.png" width="1200" /></p>

<p></p>

<pre>
<code>ERROR: Exception:
Traceback (most recent call last):
  File "C:\Users\mumuemhaha\.conda\envs\mumuemhaha\lib\site-packages\pip\_vendor\urllib3\response.py", line 438, in _error_catcher
    yield
  File "C:\Users\mumuemhaha\.conda\envs\mumuemhaha\lib\site-packages\pip\_vendor\urllib3\response.py", line 561, in read
    data = self._fp_read(amt) if not fp_closed else b""
  File "C:\Users\mumuemhaha\.conda\envs\mumuemhaha\lib\site-packages\pip\_vendor\urllib3\response.py", line 527, in _fp_read
    return self._fp.read(amt) if amt is not None else self._fp.read()
  File "C:\Users\mumuemhaha\.conda\envs\mumuemhaha\lib\site-packages\pip\_vendor\cachecontrol\filewrapper.py", line 90, in read
    data = self.__fp.read(amt)
  File "C:\Users\mumuemhaha\.conda\envs\mumuemhaha\lib\http\client.py", line 466, in read
    s = self.fp.read(amt)
  File "C:\Users\mumuemhaha\.conda\envs\mumuemhaha\lib\socket.py", line 705, in readinto
    return self._sock.recv_into(b)
  File "C:\Users\mumuemhaha\.conda\envs\mumuemhaha\lib\ssl.py", line 1274, in recv_into
    return self.read(nbytes, buffer)
  File "C:\Users\mumuemhaha\.conda\envs\mumuemhaha\lib\ssl.py", line 1130, in read
    return self._sslobj.read(len, buffer)
TimeoutError: The read operation timed out

During handling of the above exception, another exception occurred:

Traceback (most recent call last):
  File "C:\Users\mumuemhaha\.conda\envs\mumuemhaha\lib\site-packages\pip\_internal\cli\base_command.py", line 169, in exc_logging_wrapper
    status = run_func(*args)
  File "C:\Users\mumuemhaha\.conda\envs\mumuemhaha\lib\site-packages\pip\_internal\cli\req_command.py", line 248, in wrapper
    return func(self, options, args)
  File "C:\Users\mumuemhaha\.conda\envs\mumuemhaha\lib\site-packages\pip\_internal\commands\install.py", line 377, in run
    requirement_set = resolver.resolve(
  File "C:\Users\mumuemhaha\.conda\envs\mumuemhaha\lib\site-packages\pip\_internal\resolution\resolvelib\resolver.py", line 92, in resolve
    result = self._result = resolver.resolve(
  File "C:\Users\mumuemhaha\.conda\envs\mumuemhaha\lib\site-packages\pip\_vendor\resolvelib\resolvers.py", line 546, in resolve
    state = resolution.resolve(requirements, max_rounds=max_rounds)
  File "C:\Users\mumuemhaha\.conda\envs\mumuemhaha\lib\site-packages\pip\_vendor\resolvelib\resolvers.py", line 397, in resolve
    self._add_to_criteria(self.state.criteria, r, parent=None)
  File "C:\Users\mumuemhaha\.conda\envs\mumuemhaha\lib\site-packages\pip\_vendor\resolvelib\resolvers.py", line 173, in _add_to_criteria
    if not criterion.candidates:
  File "C:\Users\mumuemhaha\.conda\envs\mumuemhaha\lib\site-packages\pip\_vendor\resolvelib\structs.py", line 156, in __bool__
    return bool(self._sequence)
  File "C:\Users\mumuemhaha\.conda\envs\mumuemhaha\lib\site-packages\pip\_internal\resolution\resolvelib\found_candidates.py", line 155, in __bool__
    return any(self)
  File "C:\Users\mumuemhaha\.conda\envs\mumuemhaha\lib\site-packages\pip\_internal\resolution\resolvelib\found_candidates.py", line 143, in &lt;genexpr&gt;
    return (c for c in iterator if id(c) not in self._incompatible_ids)
  File "C:\Users\mumuemhaha\.conda\envs\mumuemhaha\lib\site-packages\pip\_internal\resolution\resolvelib\found_candidates.py", line 47, in _iter_built
    candidate = func()
  File "C:\Users\mumuemhaha\.conda\envs\mumuemhaha\lib\site-packages\pip\_internal\resolution\resolvelib\factory.py", line 206, in _make_candidate_from_link
    self._link_candidate_cache[link] = LinkCandidate(
  File "C:\Users\mumuemhaha\.conda\envs\mumuemhaha\lib\site-packages\pip\_internal\resolution\resolvelib\candidates.py", line 293, in __init__
    super().__init__(
  File "C:\Users\mumuemhaha\.conda\envs\mumuemhaha\lib\site-packages\pip\_internal\resolution\resolvelib\candidates.py", line 156, in __init__
    self.dist = self._prepare()
  File "C:\Users\mumuemhaha\.conda\envs\mumuemhaha\lib\site-packages\pip\_internal\resolution\resolvelib\candidates.py", line 225, in _prepare
    dist = self._prepare_distribution()
  File "C:\Users\mumuemhaha\.conda\envs\mumuemhaha\lib\site-packages\pip\_internal\resolution\resolvelib\candidates.py", line 304, in _prepare_distribution
    return preparer.prepare_linked_requirement(self._ireq, parallel_builds=True)
  File "C:\Users\mumuemhaha\.conda\envs\mumuemhaha\lib\site-packages\pip\_internal\operations\prepare.py", line 516, in prepare_linked_requirement
    return self._prepare_linked_requirement(req, parallel_builds)
  File "C:\Users\mumuemhaha\.conda\envs\mumuemhaha\lib\site-packages\pip\_internal\operations\prepare.py", line 587, in _prepare_linked_requirement
    local_file = unpack_url(
  File "C:\Users\mumuemhaha\.conda\envs\mumuemhaha\lib\site-packages\pip\_internal\operations\prepare.py", line 166, in unpack_url
    file = get_http_url(
  File "C:\Users\mumuemhaha\.conda\envs\mumuemhaha\lib\site-packages\pip\_internal\operations\prepare.py", line 107, in get_http_url
    from_path, content_type = download(link, temp_dir.path)
  File "C:\Users\mumuemhaha\.conda\envs\mumuemhaha\lib\site-packages\pip\_internal\network\download.py", line 147, in __call__
    for chunk in chunks:
  File "C:\Users\mumuemhaha\.conda\envs\mumuemhaha\lib\site-packages\pip\_internal\cli\progress_bars.py", line 53, in _rich_progress_bar
    for chunk in iterable:
  File "C:\Users\mumuemhaha\.conda\envs\mumuemhaha\lib\site-packages\pip\_internal\network\utils.py", line 63, in response_chunks
    for chunk in response.raw.stream(
  File "C:\Users\mumuemhaha\.conda\envs\mumuemhaha\lib\site-packages\pip\_vendor\urllib3\response.py", line 622, in stream
    data = self.read(amt=amt, decode_content=decode_content)
  File "C:\Users\mumuemhaha\.conda\envs\mumuemhaha\lib\site-packages\pip\_vendor\urllib3\response.py", line 560, in read
    with self._error_catcher():
  File "C:\Users\mumuemhaha\.conda\envs\mumuemhaha\lib\contextlib.py", line 153, in __exit__
    self.gen.throw(typ, value, traceback)
  File "C:\Users\mumuemhaha\.conda\envs\mumuemhaha\lib\site-packages\pip\_vendor\urllib3\response.py", line 443, in _error_catcher
    raise ReadTimeoutError(self._pool, None, "Read timed out.")
pip._vendor.urllib3.exceptions.ReadTimeoutError: HTTPSConnectionPool(host='files.pythonhosted.org', port=443): Read timed out.</code></pre>

<p>好多红啊，吓我一跳</p>

<p>反应过来这是因为用的是国内源所以下载速度慢，而且容易丢包，而且要命的是pip不支持断点续传结果文件下载失败，文件都不完整，安装出现时候自然出现一系列错误。</p>

<p>那好办我用国内源不就行了？</p>

<pre>
<code>pip install Pandas https://pypi.doubanio.com/simple</code></pre>

<p>注意看，我在打代码时忘记打-i原本应该为</p>

<pre>
<code>pip install Pandas -i https://pypi.doubanio.com/simple</code></pre>

<p>我还没发现，结果出现报错</p>

<pre>
<code>ERROR: Cannot unpack file C:\Users\mumuemhaha\AppData\Local\Temp\pip-unpack-njd05guz\simple.html (downloaded from C:\Users\mumuemhaha\AppData\Local\Temp\pip-req-build-44960vzz, content-type: text/html); cannot detect archive format
ERROR: Cannot determine archive format of C:\Users\mumuemhaha\AppData\Local\Temp\pip-req-build-44960vzz</code></pre>

<p>我换了好几个镜像源</p>

<p>因为过于愚蠢结果百度的搜不出来</p>

<p>然后在一检查</p>

<p>真的被自己蠢到了</p>

<p>执行前面的命令终于安装成功了</p>

<p></p>

<p>（更新）</p>

<p>注意：换的源是https的协议的</p>
