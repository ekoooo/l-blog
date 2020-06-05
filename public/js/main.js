/**
 * 消息提示
 */
(function($) {
  /**
   * @param msg 消息
   * @param type 1.success 2.warning 3.error
   */
  $.fn.message = function(msg, type) {
    var icon = 'emoji';
    
    if(type === 2) {
      icon = 'warning';
    }else if(type === 3) {
      icon = 'delete';
    }
    
    var dom = $('<span class="message"><i class="iconfont icon-' + icon + '"></i> ' + msg + '</span>');
    
    $('body').append(dom);
    
    dom.animate({
      opacity: 1,
      top: '40%'
    }, {
      duration: 300,
      // easing: 'swing',
      done: function() {
        setTimeout(function() {
          dom.animate({
            opacity: 0,
            top: '0'
          }, {
            duration: 500,
            easing: 'swing',
            done: function() {
              dom.remove();
            }
          });
        }, 2000);
      }
    });
  }
})(jQuery);

$(function() {
  /**
   * 留言相关
   * @constructor
   */
  function CommentTool() {
    var top = this;
    
    /**
     * 选择器
     */
    var selector = {
      commentBox: '#comment-tool',
      postId: '#post-id',
      parentId: '#parent-id',
      replyId: '#reply-id',
      authorName: '#author-name',
      authorMail: '#author-mail',
      authorSite: '#author-site',
      commentArea: '#comment-content-area',
      mdEditor: '#md-editor',
      sendBtn: '#send-comment',
      loadEditorBtn: '#load-editor',
      moreComment: '.comment-more',
      replyButotn: '.reply-button',
    };

    // 列表是否在加载中
    this.listLoading = false;
    
    /**
     * 验证 email 格式
     * @param email
     * @return {boolean}
     */
    var validateEmail = function(email) {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email.toLowerCase());
    };
    
    /**
     * 验证 url 格式
     * @param string
     * @return {boolean}
     */
    var validateUrl = function(string){
      return /^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*$/.test(string);
    };
    
    /**
     * 验证留言表单值
     * @param formInfo
     */
    var validForm = function(formInfo) {
      var isNullStr = function(str) {
        return str === '' || str === null || str === undefined;
      };
      
      if(isNullStr(formInfo.postId)) {
        return '参数错误';
      }
      if(isNullStr(formInfo.name)) {
        return '请输入昵称';
      }
      if(isNullStr(formInfo.mail)) {
        return '请输入邮箱';
      }
      if(isNullStr($.trim(formInfo.content))) {
        return '请输入内容';
      }
      
      // 昵称 2 ~ 16
      if(formInfo.name.length < 2 || formInfo.name.length > 16) {
        return '昵称必须 2 到 16 位';
      }
      if(!isNullStr(formInfo.mail) && !validateEmail(formInfo.mail)) {
        return '邮箱格式不正确';
      }
      if(!isNullStr(formInfo.site) && !validateUrl(formInfo.site)) {
        return '网址格式不正确';
      }
      
      return false;
    };
    
    /**
     * 发送留言
     * @param formInfo
     * @param cb
     */
    var send = function(formInfo, cb) {
      var errMsg = validForm(formInfo);
      
      if(errMsg) {
        $().message(errMsg);
        cb(false);
      }else {
        $.ajax({
          url: '/comment',
          method: 'POST',
          data: formInfo,
          dataType: 'json',
          success: function (data) {
            cb(data);
          },
          error: function() {
            cb(false);
          }
        });
      }
    };
    
    /**
     * 加载编辑器 css
     * @param cb
     */
    var loadMdEditorCss = function(cb) {
      var css = document.createElement('link');
      css.type = 'text/css';
      css.rel = 'stylesheet';
      css.href = '/manager/static/editor.md/css/editormd.min.css';
      css.onload = css.onreadystatechange = function() {
        cb && cb();
      };
      $(css).insertAfter($('title'));
    };
    
    /**
     * 加载编辑器 js
     * @param cb
     */
    var loadMdEditorScript = function(cb) {
      var script = document.createElement("script");
      script.type = 'text/javascript';
      script.src = '/manager/static/editor.md/editormd.min.js';
      script.onload = script.onreadystatechange = function() {
        cb && cb();
      };
      document.body.appendChild(script);
    };
    
    /**
     * 初始化编辑器
     */
    var initMdEditor = function(cb, mdEditorId) {
      var editor = window.editormd(mdEditorId.replace('#', ''), {
        width: "100%",
        height: 150,
        path: '/manager/static/editor.md/lib/',
        placeholder: '请输入留言，支持 Markdown...',
        lineNumbers: false,
        saveHTMLToTextarea: true,
        watch: true,
        toolbar: false,
        taskList: true,
      });
      
      editor.on('load', function() {
        cb && cb(editor);
        this.resize('200%', null);
      });
    };

    /**
     * 获取被回复的 HTML 结构
     */
    var getChildCommentHTML = function(childItem, parentItem) {
      return '<li class="comment-list-item" id="post-comment-' + childItem['id'] + '">' + 
                '  <div>' + 
                '    <p class="head">' + 
                '      <span class="name"><a target="_blank" href="' + childItem['author_site'] + '">' + childItem['author'] + '</a></span>' + 
                '      <span>回复</span>' + 
                '      <span class="name"><a target="_blank" href="' + childItem['reply_to_author_site'] + '">' + childItem['reply_to_author'] + '</a></span>' + 
                '      <span>于</span>' + 
                '      <span class="time">' + childItem['create_time'] + '</span>' + 
                '    </p>' + 
                '    <div class="content markdown-body">' + childItem['content'] + '</div>' + 
                '    <span id="reply-button-' + childItem['id'] + '"' + 
                '          data-parent-id="' + parentItem['id'] + '"' + 
                '          data-author="' + encodeURI(childItem['author']) + '"' + 
                '          data-author-site="' + encodeURI(childItem['author_site']) + '"' + 
                '          data-reply-id="' + childItem['id'] + '" class="reply-button">回复TA</span>' + 
                '  </div>' + 
                '</li>'
    };

    /**
     * 获取第一级回复的 HTML 结构
     */
    var getParentCommentHTML = function(item, index, childDom) {
      return '<li class="comment-list-item" id="post-comment-' + item['id'] + '">' +
                '  <div>' +
                '    <p class="head">' +
                '      <span class="name"><a target="_blank" href="' + item['author_site'] + '">' + index + '# ' + item['author'] + '</a></span>' +
                '      <span>于</span>' +
                '      <span class="time">' + item['create_time'] + '</span>' +
                '      <span>回复：</span>' +
                '    </p>' +
                '    <div class="content markdown-body">' + item['content'] + '</div>' +
                '    <span id="reply-button-' + item['id'] + '"' + 
                '          data-parent-id="' + item['id'] + '"' + 
                '          data-author="' + encodeURI(item['author']) + '"' + 
                '          data-author-site="' + encodeURI(item['author_site']) + '"' + 
                '          data-reply-id="' + item['id'] + '" class="reply-button">回复TA</span>' + 
                '  </div>' + childDom + 
                '</li>'
    }
    
    /**
     * 添加一个留言工具
     */
    this.initEditor = function() {
      var editor = null;
      var $commentBox = $(selector.commentBox);

      // 关闭弹窗式回复面板
      var closeCommentModal = function() {
        $('#parent-id').val(null);
        $('#reply-id').val(null);
        $('.comment-container').removeClass('fixed');
        editor && editor.resize('200%');
      }
      // 打开弹窗式回复面板
      var openCommentModal = function(parentId, replyId) {
        $('#parent-id').val(parentId);
        $('#reply-id').val(replyId);
        $('.comment-container').addClass('fixed');

        editor && editor.resize('200%');
      }
      
      if(!$commentBox.length) {
        return;
      }
      
      var $authorName = $(selector.authorName);
      var $authorMail = $(selector.authorMail);
      var $authorSite = $(selector.authorSite);
      
      // 从缓存中取昵称、邮箱、网址
      if(window.localStorage) {
        var commentInfo = JSON.parse(window.localStorage.getItem('comment_info'));
        
        if(commentInfo) {
          $authorName.val(commentInfo.name);
          $authorMail.val(commentInfo.mail);
          $authorSite.val(commentInfo.site);
        }
      }
      
      // 点击发送按钮
      $(selector.sendBtn).on('click', function (e) {
        e.preventDefault();
        
        var $t = $(this);
        var btnText = $t.val();
        $t.attr('disabled', true).val('发送中...');
        
        var params = {
          postId: $(selector.postId).val(),
          parentId: $(selector.parentId).val(),
          replyId: $(selector.replyId).val(),
          name: $authorName.val(),
          mail: $authorMail.val(),
          site: $authorSite.val(),
          content: editor && editor.getPreviewedHTML()
        };
        
        // 发送留言
        send(params, function (data) {
          $t.attr('disabled', false).val(btnText);
          
          if(!data) {
            return;
          }

          if(data.code !== 200) {
            $().message(data.message);
            return;
          }

          if(data.info.commentCheck) {
            $().message('评论成功，需管理员审核才能展示');
          }else {
            $().message('评论成功');

            // 如果是引用回复，则直接添加 DOM ，否则请求刷新即可
            if(params.parentId && params.replyId) {
              closeCommentModal();

              var $replyButton = $('#reply-button-' + params.replyId);
              var childHtml = getChildCommentHTML({
                id: data.info.id,
                content: data.info.childInfo.content,
                create_time: data.info.childInfo.createTime,
                post_id: params.postId,
                author_site: params.site,
                author: params.name,
                reply_to_author_site: decodeURI($replyButton.data('authorSite')),
                reply_to_author: decodeURI($replyButton.data('author')),
              }, {
                id: params.parentId
              });

              var parentSelector = '#post-comment-' + params.parentId;
              var $childList = $(parentSelector + ' .comment-list-child');

              $childList.length ? 
                $childList.append(childHtml) : 
                $(parentSelector).append('<ul class="comment-list-child">' + childHtml + '</ul>')

              // 更新总条数
              var $count = $('.comment-info-count');
              $count.text(parseInt($count.text()) + 1);
            }else {
              // 刷新列表
              top.initCommentList(true);
            }
          }
          
          // 清空
          editor.setMarkdown('');

          // 昵称，邮箱，网址保存到
          window.localStorage && window.localStorage.setItem('comment_info', JSON.stringify({
            name: params.name,
            mail: params.mail,
            site: params.site,
          }));
        });
      });
      
      // 点击使用 markdown 编辑器
      $(selector.loadEditorBtn).on('click', function (e) {
        e.preventDefault();
        $(e.currentTarget).val('正在加载编辑器...');
        
        // 加载资源
        loadMdEditorCss(function() {
          loadMdEditorScript(function() {
            initMdEditor(function (mdEditor) {
              $(e.currentTarget).hide();
              $().message('编辑器加载成功');
              
              $('html, body').animate({
                scrollTop: $commentBox.offset().top - 70 + 'px'
              }, {
                duration: 500,
                easing: 'swing'
              });
              
              editor = mdEditor;
            }, selector.mdEditor);
          });
        });
      });
      
      // 如果网址没有填写协议前缀则自动填写
      $(selector.authorSite).on('blur', function() {
        var val = $(this).val();
        
        if(val.length > 0 &&
          val.indexOf('http://') !== 0 &&
          val.indexOf('https://') !== 0 &&
          val.indexOf('tfp://') !== 0) {
          $(this).val('http://' + val);
        }
      });
      
      // 加载更多留言
      $(selector.moreComment).on('click', function() {
        if(!top.listLoading) {
          top.listLoading = true;
          top.initCommentList();
        }
      });

      // 引用回复
      $('.comment-list').on('click', selector.replyButotn, function(e) {
        openCommentModal(this.dataset.parentId, this.dataset.replyId);
      });

      // 回复弹出点击 modal 关闭
      $('.comment-container').on('click', function(e) {
        if($(e.target).hasClass('comment-container')) {
          closeCommentModal();
        }
      });
    };

    /**
     * 加入留言
     * @param init true 则为显示第一页信息，加入信息
     */
    this.initCommentList = function(init) {
      // 检测是否有显示留言节点
      var $commentInfo = $('.comment-info');
      if(!$commentInfo.length) {
        return;
      }
      
      var postId = $commentInfo.attr('data-post-id');
      var pageId = $commentInfo.attr('data-page');
      var $moreComment = $(selector.moreComment);
      var moreCommentText = $moreComment.text();

      $moreComment.text('加载中...');
      
      if(init) {
        pageId = -1;
      }

      $.ajax({
        url: '/comment?page=' + (++pageId) + '&postId=' + postId,
        method: 'GET',
        dataType: 'json',
        success: function (data) {
          if(data.code === 200) {
            var pageSize = data.pageSize;
            var list = data.list;
            var totalPage = parseInt((data.totalCount + pageSize - 1) / pageSize);
    
            $commentInfo.attr('data-page', data.pageId);
            
            // 显示更早留言按钮
            if(totalPage <= data.pageId + 1) {
              $moreComment.hide();
            }else {
              $moreComment.show();
            }
    
            // 显示留言条数
            $('.comment-info-count').text(data.count);
    
            var listDom = $('.comment-list');
            var count = undefined;
            
            if(init) {
              listDom.empty();
              count = 0;
              $commentInfo.attr('data-count', list.length);
            }else {
              count = Number($commentInfo.attr('data-count'));
              $commentInfo.attr('data-count', count + list.length);
            }
            
            // 显示数据
            for(var i = 0; i < list.length; i++) {
              var item = list[i];

              var childDom = '';
              var childItem;

              for(var j = 0; j < item.childList.length; j++) {
                childItem = item.childList[j];
                childDom += getChildCommentHTML(childItem, item);
              }

              if(childDom.length) {
                childDom = '<ul class="comment-list-child">' + childDom + '</ul>'
              }

              listDom.append(getParentCommentHTML(item, count + i + 1, childDom));
            }
          }

          top.listLoading = false;
          $moreComment.text(moreCommentText);
        }
      });
    }
  }
  
  /**
   * 文章页面 TOC 动画滚动
   */
  function initMarkdownTocAnimate() {
    $('.markdown-toc a').on('click', function (e) {
      e.preventDefault();

      var name = decodeURI(this.href.split('#')[1]);
      
      $('html, body').animate({
        scrollTop: $('.reference-link[name="' + name + '"]').offset().top - 70 + 'px'
      }, {
        duration: 500,
        easing: 'swing'
      });
    });
  }
  
  /**
   * 投票
   */
  function initVote() {
    var postId = $('.post-box').attr('data-post-id');
    
    $('.post-vote .post-vote-item').on('click', function() {
      if($('.post-vote-item i.active').length) {
        $().message('您已投过票了！');
      }else {
        var thiz = this;
        var isUnlike = $(this).hasClass('unlike');
        
        $.ajax({
          type: 'POST',
          url: (isUnlike ? '/post/unlike/' : '/post/like/') + postId,
          success: function (data) {
            if(data.code === 200) {
              var item = $(thiz).find('i');
              var vote = isUnlike ? $('.unlike-num') : $('.like-num');
              
              if(isUnlike) {
                item.removeClass('icon-emoji').addClass('pink active icon-emoji_fill');
              }else {
                item.removeClass('icon-praise').addClass('pink active icon-praise_fill');
              }
              
              vote.text(Number(vote.eq(0).text()) + 1);
              
              $().message('投票成功！');
            }else {
              $().message(data.message);
            }
          },
          dataType: 'json'
        });
      }
    });
  }
  
  /**
   * markdown 链接在新窗口打开
   */
  function initMarkdownLinkTarget() {
    $('.markdown-body a:not([class^="toc-level"])').attr('target', '_blank');
  }
  
  /**
   * 初始化 sidebar
   */
  function initSidebar() {
    $('.sidebar-op').on('click', function() {
      var sidebar = $('.sidebar');
      // 第一次初始化数据
      if(!sidebar.attr('data-init')) {
        $.ajax({
          method: 'GET',
          url: '/sidebar',
          dataType: 'json',
          success: function (data) {
            if(data.code === 200) {
              var info = data.info;
              
              $('.author-ch-name').text(info['ch_name']);
              $('.author-en-name').text(info['en_name']);
              $('.collection-post-num').text(info['post_num']);
              $('.collection-category-num').text(info['post_category_num']);
              $('.collection-tag-num').text(info['post_tag_num']);
              
              var linksBox = $('.author-links');
              for(var i = 0; i < info.links.length; i++) {
                linksBox.append('<a target="_blank" href="' + info.links[i].href + '">' + info.links[i].label + '</a>');
              }

              var friendsLinksBox = $('.friends-links');
              for(var i = 0; i < info.friends_links.length; i++) {
                friendsLinksBox.append('<a target="_blank" href="' + info.friends_links[i].href + '">' + info.friends_links[i].label + '</a>');
              }
              
              // 加入标志
              sidebar.attr('data-init', '1');
            }else {
              $.message(data.message);
            }
          }
        });
      }
      
      $('body').toggleClass('sidebar-open');
    });
    
    $('.sidebar .author-avatar img').on('mouseover mouseleave', function (e) {
      $(this).attr('src', e.type === 'mouseover' ? '/img/logo.gif' : '/img/logo_1.png');
    });
  }
  
  /**
   * 移动端菜单缩放
   */
  function initMenu() {
    $('.nav .switch').on('click', function() {
      $(this).parent().toggleClass('active');
    });
  }
  
  /**
   * 留言
   */
  function initComment() {
    var comment = new CommentTool();

    comment.initEditor();
    comment.initCommentList(true);
  }
  
  /**
   * 初始化
   */
  function init() {
    initMarkdownTocAnimate();
    initVote();
    initMarkdownLinkTarget();
    initSidebar();
    initMenu();
    initComment();
  }
  
  init();
});