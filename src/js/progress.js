(function(root) {
    // 进度条
    function Progress() {
        this.durTime = 0;
        this.frameId = null;
        this.startTime = 0;
        this.lastPercent = 0;

        this.init();
    }
    Progress.prototype = {
        init: function() { //初始化
            this.getDom();
        },
        getDom: function() { // 获取dom元素
            this.curTime = document.querySelector('.curTime');
            this.circle = document.querySelector('.circle');
            this.frontBg = document.querySelector('.frontBg');
            this.totalTime = document.querySelector('.totalTime');
        },
        renderAllTime: function(time) { // 渲染总时间
            this.durTime = time;
            time = this.formatTime(time);

            this.totalTime.innerHTML = time;
        },
        formatTime: function(time) { // 时间格式化， 秒 转 00:00
            time = Math.round(time); //Math.round() 函数返回一个数字四舍五入后最接近的整数 在update方法更新进度条中用到
            var m = Math.floor(time / 60);
            var s = time % 60;
            m = m < 10 ? '0' + m : m; // 补0
            s = s < 10 ? '0' + s : s;
            return m + ":" + s;
        },

        // 移动进度条
        move: function(per) {
            var This = this;

            cancelAnimationFrame(This.frameId); // 解决播放状态下 点击切换下一首然后点暂停 播放器左边时间继续走动的情况

            this.lastPercent = per === undefined ? this.lastPercent : per; // 判断用户有没有传值

            this.startTime = new Date().getTime(); // 按下播放按钮的时候记录一个时间

            function frame() {
                var curTime = new Date().getTime();
                var per = This.lastPercent + (curTime - This.startTime) / (This.durTime * 1000);

                if (per <= 1) {
                    This.update(per);
                } else {
                    cancelAnimationFrame(This.frameId)
                }

                This.frameId = requestAnimationFrame(frame);
            }
            frame();
        },
        // 更新进度条
        update: function(per) {
            // 更新左边的时间
            var time = this.formatTime(per * this.durTime);
            this.curTime.innerHTML = time;

            // 更新进度条的位置
            this.frontBg.style.width = per * 100 + '%'

            // 更新圆点的位置
            var l = per * this.circle.parentNode.offsetWidth;
            this.circle.style.transform = 'translateX(' + l + 'px)';
        },
        // 暂停进度条
        stop: function() {
            cancelAnimationFrame(this.frameId);

            var stopTime = new Date().getTime();
            this.lastPercent += (stopTime - this.startTime) / (this.durTime * 1000); // 记录点击暂停时所走的时间百分比
        }
    }

    function instanceProgress() {
        return new Progress();
    }


    // 拖拽
    function Drag(obj) {
        this.obj = obj;
        this.starPointX = 0;
        this.startLeft = 0;
        this.percent = 0;
    }
    Drag.prototype = {
        init: function() {
            var This = this;

            this.obj.style.transform = 'translateX(0)';

            // 手指按下
            this.obj.addEventListener('touchstart', function(ev) {
                This.starPointX = ev.changedTouches[0].pageX; // 屏幕上不止有一个手指落下，所以这里[0]代表取第0个手指落下
                This.startLeft = parseFloat(this.style.transform.split('(')[1]);

                This.start && This.start();
            });

            // 手指移动

            this.obj.addEventListener('touchmove', function(ev) {
                This.disPonitX = ev.changedTouches[0].pageX - This.starPointX;
                var l = This.startLeft + This.disPonitX;
                if (l < 0) {
                    l = 0;
                } else if (l > this.offsetParent.offsetWidth) {
                    l = this.offsetParent.offsetWidth;
                }
                this.style.transform = 'translateX(' + l + 'px)';

                This.percent = l / this.offsetParent.offsetWidth;
                This.move && This.move(This.percent);

                ev.preventDefault(); // 阻止浏览器默认行为
            });

            // 拖拽结束
            this.obj.addEventListener('touchend', function(ev) {
                This.end && This.end(This.percent);
            });

        }
    }

    function instanceDrag(obj) {
        return new Drag(obj);
    }

    root.progress = {
        pro: instanceProgress,
        drag: instanceDrag,
    }

})(window.player || (window.player = {}))