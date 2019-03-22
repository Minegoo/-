
/* 总体思路为：用户点击难度按钮选项，根据不同难度生成大小不同的雷盘，
然后点击startgame按钮，随机生成雷，就相当于先放好盘子，然后再上菜
左键点击：如果点击的块有雷，直接死掉，如果没有雷就计算四周八个格子的雷数，将雷数写入当前块
当雷数为零时，周围八个格开始进行扩散，就是以八个格各自为中心开始数它们各自周围八个格的雷数
但是要注意的是要给已经数过的格子表上标记（我这里标记的是checked），避免来来回回反复计算，陷入死循环*/


// 利用js中变量未经声明归于全局所有，将要用的变量存在全局中
/*将经常遇到选中的dom元素先存起来，比如数值经常变化的剩余雷数所在的dom元素 
游戏区域content*/
num = $('.main .num span');
flag = false;
content = $('.main .content');


// 对难度选择区域绑定点击事件，根据难度不同，即将生成的雷盘大小与雷数都不一样
$('.side').on('click', function (e) {
    // 用户切换难度按钮时，在生成雷之前，雷数都归于零。
    num.text(0)
    var content = $(e.target).text();
    switch (content) {
        // 如果是简单层次的，就生成十个雷，以此类推
        case '简单':
            createDom(10);
            break;
        case '中等':
            createDom(12);
            break;
        case '复杂':
            createDom(15);
    }
})


// 生成雷盘：
function createDom(num) {
    // 将所要生成的雷数num存在全局中
    wnum = num;
    str = '';
    for (var i = 0; i < num; i++) {
        for (var j = 0; j < num; j++) {
            str += '<li class=' + i + '-' + j + '></li>'
        }
    }

    $('.main .content').css({ 'width': num * 50, 'height': num * 50 }).html(str);
}


// 开始生成雷
$('.start').on('click', function (e) {
    /* flag原始为false,只有点击了startgame按钮之后，flag变成true，
    才能在雷盘区域点击，进行游戏*/
    flag = true;
    // 将所有格子的dom元素列表liList存在全局上，以便后续调用
    liList = $('.main .content li');
    // 如果重复点击startgame时，每次都要将之前生成的雷去掉
    if ($('.lei').length) {
        $('.lei').removeClass('lei');
    }
    // 随机生成雷时，要避免会生成重复的数字，这里利用一个数组来存储生成的数字，剔除重复的
    var arr = [];
    var t = wnum;
    while (t) {
        var n = Math.floor(Math.random() * wnum * wnum);
        if (arr.indexOf(n) == -1) {
            arr.push(n);
            $(liList[n]).addClass('lei')
            t--
        }
    }
    // 显示剩余雷数，表明已经生成雷，可以进行游戏了
    num.text(wnum);
})


// 取消雷盘和弹出块的右键出菜单默认事件
content.on('contextmenu', function () {
    return false;
})
$('.boom').on('contextmenu', function () {
    return false;
})


// 先根据flag判断是否已经生成雷
content.on('mousedown', function (e) {
    if (flag) {
        var dom = $(e.target);
        if (e.which == 1) {
            // 左键点击时
            if (dom.hasClass('lei')) {
                // 碰巧有雷时
                $('.boom').css('display', 'block')
            } else {
                // 此格没有雷，开始计算周边雷数
                shuLei(dom)
            }
        } else {
            /*右键点击时，有三种情况，一种是右键点击已经标记过雷数的格子
            一种是已经标记认定此处有雷的格子，最后一种是没有标记过的格子*/
            if (dom.hasClass('checked')) {
                // 已经数过雷数的格子点击不起作用
                return;
            }
            if (dom.hasClass('bingo')) {
                /*对于已经被标记为雷的格子，再次点击即取消认定
                当取消认定的格子上原本有雷时，剩余雷数++*/
                dom.removeClass('bingo');
                if (dom.hasClass('lei')) {
                    wnum++;
                    num.text(wnum);

                }
            } else {
                // 右键点击还未标记的格子
                if (dom.hasClass('lei')) {
                    // 刚好此处有雷时，添加标记，雷数--
                    dom.addClass('bingo');
                    wnum--;
                    num.text(wnum);
                    if (wnum == 0) {
                        // 当剩余雷数等于0时，弹出提示块
                        $('.boom span').text('you win');
                        $('.boom').css('display', 'block')
                    }
                    
                } else {
                    // 此处无雷时，还是要给予认定此处有雷的标记
                    dom.addClass('bingo');

                }
            }




        }
    }

})


// 数周围八个格子雷数的函数
function shuLei(dom) {
    if (dom.hasClass('checked')) {
        // 如果这个格子已经数过了，则不做处理
        return;
    }
    // 刚开始周围雷数总数为 0
    var num = 0;
    // 得出当前格子的位置信息
    var clas = dom.attr('class');
    var clasArr = clas.split('-');
    // 将字符串类型数字转为数字类型
    var x = +clasArr[0];
    var y = +clasArr[1];
    // 循环遍历八个格子中哪些有雷，有雷的话，雷数总数++
    for (var i = x - 1; i <= x + 1; i++) {
        for (var j = y - 1; j <= y + 1; j++) {
            if (i == x && j == y) {
                continue;
            }
            var oli = $('.' + i + '-' + j);
            if (oli.hasClass('lei')) {
                num++;
            }
        }
    }
    // 将雷数总数填入当前格子
    dom.text(num);
    // 标记为已查过
    dom.addClass('checked')
    // 如果填入数字为 0，则代表周围没有雷，分别给该格子周围八个格子逐个数雷数
    if (num == 0) {
        for (var i = x - 1; i <= x + 1; i++) {
            for (var j = y - 1; j <= y + 1; j++) {
                if (i == x && j == y) {
                    // 忽略当前格子
                    continue;
                }
                var dli = $('.' + i + '-' + j);
                // 确定该格子是存在的在进行数雷数
                dli.length && shuLei(dli);
            }
        }
    }
}
