(function($) {
    $.fn.message = function(msg) {
        var dom = $('<span class="message">' + msg + '</span>');
        
        $('body').append(dom);
        
        dom.animate({
            opacity: 1,
            top: '40%'
        }, {
            duration: 300,
            // easing: 'swing',
            done: function () {
                setTimeout(function () {
                    dom.animate({
                        opacity: 0,
                        top: '0'
                    }, {
                        duration: 500,
                        easing: 'swing',
                        done: function () {
                            dom.remove();
                        }
                    });
                }, 2000);
            }
        });
    }
})(jQuery);


$(function () {
    /**
     * 文章页面 TOC 动画滚动
     */
    function initMarkdownTocAnimate() {
        $('.markdown-toc a').on('click', function (e) {
            e.preventDefault();
        
            $('html, body').animate({
                scrollTop: $('.reference-link[name="' + this.href.split('#')[1] + '"]').offset().top - 70 + 'px'
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
        
        $('.post-vote .post-vote-item').on('click', function () {
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
        $('.sidebar-op').on('click', function () {
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
     * 初始化
     */
    function init() {
        initMarkdownTocAnimate();
        initVote();
        initMarkdownLinkTarget();
        initSidebar();
    }
    
    init();
});