//值得学习的内容：
//创建json文件
//删除文件

var fileName = process.argv[2];
///process.argv存储输入的命令
///node server.js ***
///path1/node.run_exe
///path2/server.js
///***输入的第三个参数

//可供处理的数据有三部分：基网格、PM过程、骨骼
//输出的数据：处理基网格、分解PM信息、复制骨骼（提供索引）
var fs = require('fs');
var express = require('express');
var app = express();

var baseMesh = null;
var pmMesh = null;

function setupFile(fileName , callback)
{
	//加载完成后执行callback
    function loadCallback()
	{
		if (baseMesh && pmMesh)
		{
			if (callback)
				callback();
		}
	}

	///应该是清空文件夹中的全部内容
    var deleteFolderRecursive = function(path)
    {
        var files = [];

        if( fs.existsSync(path) ) {
            files = fs.readdirSync(path);
            files.forEach(function(file,index){
                var curPath = path + "/" + file;
                console.log(curPath);
                if(fs.statSync(curPath).isDirectory()) { // recurse
                    deleteFolderRecursive(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    };

    ///startup.json文件夹中的内容只有PM模型的名称
	var startup = {
	    'mainScene': fileName
    };

	///将startup写入viewer文件夹当中
    fs.writeFile('viewer/startup.json' , JSON.stringify(startup , null, "\t") , function(){});

    deleteFolderRecursive('viewer/pm');

    if (fs.existsSync('viewer/' + fileName) == false)
    {
        fs.mkdirSync('viewer/' + fileName);
    }

    if (fs.existsSync('viewer/' + fileName + '/pm/') == false)
    {
        fs.mkdirSync('viewer/' + fileName + '/pm/');
    }

	// setup base mesh
	fs.readFile('data/' + fileName + '_out_base.json', 'utf8' , function (err , data) {
		if(err){
			return console.log(err);
		}

		baseMesh = JSON.parse(data);

		var vertices = [];
		var normals = [];
		var uvs = [];
		var faces = [];
		var uvFaces=[];
        var materials=[];

        ///设置基网格的verts
		for (var i = 0 ; i < baseMesh.verts.length ; ++i)
			vertices.push(baseMesh.verts[i]);

		///设置基网格的UV
		for(var i = 0 ; i < baseMesh.uvs.length ; ++i)
			uvs.push(baseMesh.uvs[i]);

	    //materials
		materials=baseMesh.materials;

		//material has some
		for(var material_id=0;material_id<baseMesh.materials.length;material_id++)
		{
		  var tmpFaces=[];
		  var tmpUvFaces=[];
          for (var i = 0 ; i < baseMesh.faces[material_id].length ; i+=2)
          {
            tmpFaces.push(baseMesh.faces[material_id][i+0]);
			tmpUvFaces.push(baseMesh.faces[material_id][i+1]);
          }
		  faces.push(tmpFaces);
		  uvFaces.push(tmpUvFaces);
		}

		///重写基网格// re-write base mesh
		var jsonMesh = {
			'metadata' : {
				'version': '4.3',
				'type' : 'Object',
				'generator' : 'pm'
			},
			'geometries' :
			[
                {
                    'uuid': 'a0a7fb57-d673-4396-880e-337991b1700b',
                    'type': 'Geometry',
                    "data": {
                        "vertices": vertices,
                        "normals": normals,
                        "uvs": uvs,
                        "faces": faces,
						"Uvfaces":uvFaces,
						"materials": materials
                    }
                }
			],
            "materials": [
                {
                    "uuid": "3d5f5f49-a7b3-4868-88d2-50adced0b6ed",
                    "name": "Test",
                    "type": "MeshStandardMaterial",
                    "side": "2",
                    "color": "0xFFFFFF",
                    "emissive": "0x000000",
                    "opacity": 1,
                    "roughness": 0.75,
                    "metalness": 0,
                    "lightMap": "6c8c18c9-7732-479b-8b16-07764363b3ed_MainTex",
                    "transparent": false,
                    "wireframe": false
                }
            ],
            "object": {
                "uuid": "33343335-3246-42a1-a7a1-a034e4217306",
                "type": "Object3D",
                "name": "World",
                "matrix": [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
                "children": [
                    {
                        "uuid": "f6d4d957-2dce-40a9-9dc4-c802786e7405",
                        "type": "Object3D",
                        "name": "RealisticCar02_HD_Complete",
                        "matrix": [0,0,1,0,0,1,0,0,-1,0,0,0,0,0,0,1]
                    },
                    {
                        "uuid": "4839a1e5-ad5c-4e4c-951c-a764b57a30c8",
                        "type": "Object3D",
                        "name": "ParamsAnchor",
                        "matrix": [0,0,1,0,0,1,0,0,-1,0,0,0,0,0,0,1]
                    },
                    {
                        "uuid": "30e268a8-ada7-4e23-b6fa-a6ec06b8b609",
                        "type": "Object3D",
                        "name": "Length",
                        "matrix": [0,0,1,0,0,1,0,0,-1,0,0,0,0,0,0,1]
                    },
                    {
                        "uuid": "e5c76d30-d1d2-4e39-abb5-563acebae44c",
                        "type": "Object3D",
                        "name": "LengthStart",
                        "children": [
                            {
                                "uuid": "908ecffa-013e-46f4-ab0d-b8f443a1f5e9",
                                "type": "Mesh",
                                "name": "LengthStart_481259D8_SubMesh 0",
                                "geometry": "a0a7fb57-d673-4396-880e-337991b1700b",
                                "material": "3d5f5f49-a7b3-4868-88d2-50adced0b6ed",
                                "userdata": {}
                            }
                        ],
                        "matrix": [0,0,1,0,0,1,0,0,-1,0,0,0,0,0,0,1]
                    }
                ]
            }
		};

		fs.writeFile('viewer/' + fileName + '/basemesh.json' , JSON.stringify(jsonMesh , null, "\t") , function(){});

        fs.writeFile('viewer/' + fileName + '/skeletonindex.json' , JSON.stringify(baseMesh.skeletonLibs , null) , function(){});

		loadCallback();
	});

    ///读取文件*_out_pm.json// setup pm mesh
	fs.readFile('data/' + fileName + '_out_pm.json', 'utf8' , function (err , data) {
	    if (err) return console.log(err);
		pmMesh = JSON.parse(data);

		var trunkCount = 20;

		//console.log(pmMesh.splits.length);
        //console.log(pmMesh.splits.length);
		for (var i = 0 ; i < pmMesh.splits.length ; i += trunkCount)///20个一组进行划分
        {
            var trunkSplits = [];
            var count = Math.min(trunkCount , pmMesh.splits.length - i);
            for (var ti = 0 ; ti < count ; ++ti){//除了最后一个外count的值为20
                trunkSplits.push(pmMesh.splits[i + ti]);//json中的数据是trunkSplits
            }
            fs.writeFileSync('viewer/' + fileName + '/pm/pmmesh' + (i / trunkCount) + '.json' , JSON.stringify(trunkSplits , null, "\t"));
        }
		//console.log(i,trunkCount);//0,20
        fs.writeFileSync('viewer/' + fileName + '/pm/desc.json' , JSON.stringify({splitCount: (i / trunkCount)} , null, "\t"));//记录PM文件的个数

		loadCallback();
	});

    fs.readFile('data/' + fileName + '_out_skeleton.json', 'utf8' , function (err , data) {
        var skeletonData = JSON.parse(data);
        fs.writeFileSync('viewer/' + fileName + '/skeleton.json' , JSON.stringify(skeletonData , null));
    });
}

if (fileName)
{
    //fs.mkdirSync('viewer/' + fileName);

    setupFile(fileName , function()
    {
        app.use('/', express.static('viewer' + '/'));
        app.listen(8080);

        console.log('listen 8080...');
    });
}
else
{
    console.log('plz specify target model');
}


