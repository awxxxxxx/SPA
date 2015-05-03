/**
 * @namespace spa.shell.js
 * @author: waterbear
 */

spa.shell = (function() {
    'use strict';
    /** 静态配置文件 */
    var configMap = {
        /** 锚状态 */
        anchor_schea_map: {
            chat: {
                opened: true,
                closed: true
            }
        },
        main_html: String()
            + '<div class="spa-shell-head">'
             + '<div class="spa-shell-head-logo"></div>'
             + '<div class="spa-shell-head-acct"></div>'
             + '<div class="spa-shell-head-search"></div>'
            + '</div>'
            +'<div class="spa-shell-main">'
             + '<div class="spa-shell-main-nav"></div>'
             + '<div class="spa-shell-main-content"></div>'
            + '</div>'
            + '<div class="spa-shell-foot"></div>'
            + '<div class="spa-shell-chat"></div>',

        /** 滑块的配置 */
        chat_extend_time: 1000,
        chat_retract_time: 300,
        chat_extend_height: 450,
        chat_retract_height: 15,
        chat_extended_title: '点击收起窗口',
        chat_retracted_title: '点击展开窗口'
    },

    /** 模块中共享的动态信息 */
    stateMap = {
        $container: null,
        anchor_map: {},
        is_chat_retracted: true
    },
    jqueryMap = {},
    setJqueryMap, setChatAnchor, onClickChat,
    copyAnchorMap, changeAnchorPart, onHashchange,
    onTapAcct, initModule, onLogin, onLogout;

    /** 复制锚对象 */
    copyAnchorMap = function() {
        return $.extend(true, {}, stateMap.anchor_map);
    };

    /**
     * 更改指定键的内容
     */
    changeAnchorPart = function(arg_map) {
        var anchor_map_revise = copyAnchorMap(),
            bool_return = true,
            key_name, key_name_dep;

        /** 合并改变的状态 */
        KEYVAL:
        for(key_name in arg_map) {
            if(arg_map.hasOwnProperty(key_name)) {

                /** 跳过关联的 key */
                if(key_name.indexOf('_') === 0) {
                    continue KEYVAL;
                }
                anchor_map_revise[key_name] = arg_map[key_name];
                key_name_dep = '_' + key_name;
                if(arg_map[key_name_dep]) {
                    anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
                }
                else {
                    delete anchor_map_revise[key_name_dep];
                    delete anchor_map_revise['_s' + key_name_dep];
                }
            }
        }

        /** 更新URI 不能通过模式验证则抛出异常，回滚锚状态 */
        try {
            $.uriAnchor.setAnchor(anchor_map_revise);
        }
        catch(error) {
            $.uriAnchor.setAnchor(stateMap.anchor_map, null, true);
            bool_return = false;
        }
    };

    /**
     * 锚状态改变后进行处理
     */
    onHashchange = function(event) {
        var anchor_map_previous = copyAnchorMap(),
            anchor_map_proposed,
            _s_chat_previous, _s_chat_proposed,
            s_chat_proposed,
            is_ok = true;
        try {
            anchor_map_proposed = $.uriAnchor.makeAnchorMap();
        }
        catch(error) {
            $.uriAnchor.setAnchor(anchor_map_previous, null, true);
            return false;
        }
        stateMap.anchor_map = anchor_map_proposed;

        _s_chat_previous = anchor_map_previous._s_chat;
        _s_chat_proposed = anchor_map_proposed._s_chat;

        /** 状态改变后调整 */
        if(!anchor_map_previous || _s_chat_previous !== _s_chat_proposed) {
            s_chat_proposed = anchor_map_proposed.chat;
            switch(s_chat_proposed) {
                case 'opened':
                    is_ok = spa.chat.setSliderPosition('opened');
                break;
                case 'closed':
                    is_ok = spa.chat.setSliderPosition('closed');
                break;
                default:
                    spa.chat.setSliderPosition('closed');
                    delete anchor_map_proposed.chat;
                    $.uriAnchor.setAnchor(anchor_map_proposed, null, true);
            }
        }

        /** 状态调整失败则回滚到以前的默认值 */
        if(!is_ok) {
            if(anchor_map_previous) {
                $.uriAnchor.setAnchor(anchor_map_previous, null, true);
                stateMap.anchor_map = anchor_map_previous;
            }
            else {
                delete anchor_map_proposed.chat;
                $.uriAnchor.setAnchor(anchor_map_proposed, null, true);
            }
        }
        return false;
    };

    /**
     * 回调函数
     * 用于传给 chat 模块
     */
    setChatAnchor = function(position_type) {
        return changeAnchorPart({chat: position_type});
    };


    /**
     * DOM 操作方法
     */
    setJqueryMap = function() {
        var $container = stateMap.$container;
        jqueryMap = {
            $container: $container,
            $acct: $container.find('.spa-shell-head-acct'),
            $nav: $container.find('.spa-shell-main-nav')
        };
    };

    /**
     * 弹出登录框
     */
    onTapAcct = function(event) {
        var acct_text, user_name,
            user = spa.model.people.get_user();
        if(user.get_is_anon()) {
            user_name = prompt('Please sign-in');
            spa.model.people.login(user_name);
            jqueryMap.$acct.text('... processing ...');
        }
        else {
            spa.model.people.logout();
        }
        return false;
    };

    /**
     * 登录后修改状态
     */
    onLogin = function(event, login_user) {
        jqueryMap.$acct.text(login_user.name);
    };

    onLogout = function(event, logout_user) {
        jqueryMap.$acct.text('Please sign-in');
    };

    /** 公开方法 */
    initModule = function($container) {
        stateMap.$container = $container;
        $container.html(configMap.main_html);
        setJqueryMap();
        $.uriAnchor.configModule({
            schema_map: configMap.anchor_schea_map
        });

        /** 初始化 chat 模块 配置*/
        spa.chat.configModule({
            set_chat_anchor: setChatAnchor,
            chat_model: spa.model.chat,
            people_model: spa.model.people
        });
        spa.chat.initModule(jqueryMap.$container);
        spa.avtr.configModule({
            chat_model: spa.model.chat,
            people_model: spa.model.people
        });
        spa.avtr.initModule(jqueryMap.$nav);

        /** 初始化功能模块 */
        $(window).bind('hashchange', onHashchange)
                 .trigger('hashchange');

        $.gevent.subscribe($container, 'spa-login', onLogin);
        $.gevent.subscribe($container, 'spa-logout', onLogout);
        jqueryMap.$acct
            .text('Please sign-in')
            .bind('utap', onTapAcct);
    };

    /** 导出公开方法 */
    return {
        initModule: initModule
    };
}());
