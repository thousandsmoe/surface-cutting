<?php
	/*	
		Ainou Surface Cutting[surface-cutting]
		via http://thousandmoe.github.com/surface-cutting
		Copyright 2012 青石千梦[thousandmoe]
		yougewangyi@126.com
		Released under the GPL Licenses.
	*/
	@error_reporting(0);	//屏蔽错误报告
	@header('Content-Type: text/html; charset=utf-8');	//用于治疗某些国外空间乱码的坏毛病。PH(php & html)合璧，疗效快=w=
	@set_time_limit(0);	//防止传大图的时候到达限制时间而退出，话说到达限制时间那是有多大的图啊=v=
	
	//图片处理流程
	if(isset($_FILES["file"])){
		$base64=base64_encode(file_get_contents($_FILES["file"]["tmp_name"]));	//base64编码上传的文件
		$src='data:'.$_FILES["file"]["type"].';base64,'.$base64;	//输出类似于data:image/png;base64,blahblah这样的格式=w=这样才能做到不保存图片~
	}else{
		$src='surface0.png';
	}
?>
<html>
	<head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>Ainou Surface Cutting</title>
		<style>
			#header{
				margin-left:20px;
				font-size:20pt;
				font-family:Consolas;
				color:#27E03E;
				border-bottom:dashed #999 1px;
			}
			body{
				font-family:'微软雅黑','Microsoft YaHei','宋体';
				width:600px;
			}
			a{
				text-decoration:none;
				color:#66ccff;/*天依蓝=v=~*/
			}
			.des{
				margin-left:20px;
				padding-top:3px;
				padding-bottom:6px;
				border-bottom:dashed #999 1px;
			}
		</style>
	</head>
	<body>
	<div id="header">
		Ainou Surface Cutting
	</div>
	<div id="description" class="des">
		请浏览您的shell图片后提交，您的shell图片将出现在下方。<br />
		请使用鼠标拖动选取对应的区域，然后复制下方的坐标。<br />
		本程序不会保存您的shell图片，请放心使用。<br />
		如果页面浏览有困扰，请使用最新版Firefox或者Google Chrome浏览器。<br />
		默认图片取自「葡萄的葡萄架子」的人格「炸酱一只」，未经授权请勿作它用。<br />
		项目主页：<a href="http://thousandmoe.github.com/surface-cutting">surface-cutting</a><br />
	</div>
		<form action="<?=$_SERVER['PHP_SELF'];?>" method="post" enctype="multipart/form-data" id="control" class="des">
		上传：<input type="file" name="file" id="file" size="20" /><input type="submit" value="提交" /><br />
		坐标：<input name="ukagaka" id="ukagaka" size="20" type="text"></form>
		<script src="v.js"></script>
		<script language="javascript">
			v.load('vcrop.js', function(){
			v.$('#rawimg').crop({'ukagaka':'#ukagaka'
			});
		});
		</script>
		<div id="showcrop">
			<div style="padding-left:20px;" id="imgbox"><img id="rawimg" src="<?=$src;?>"></div>
		</div>
	</body>
</html>