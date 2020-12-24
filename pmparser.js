var fileName = process.argv[2];

var obj2gltf = require('obj2gltf');
var fs = require('fs');
var express = require('express');
var app = express();

var baseMesh = null;
var pmMesh = null;

var vertexPrecision = 5;
var texPrecision = 4;

var outputFileName = fileName + '_pm';
function setupFile(fileName , callback)
{
	function loadCallback()
	{
		if (baseMesh && pmMesh)
		{
			if (callback)
			{
				callback();
			}
		}
	}
	
	// setup base mesh
	fs.readFile('data/' + fileName + '_out_base.json', 'utf8' , function (err , data) {
		if (err)
		{
			return console.log(err);
		}

		var objMtlData =
            'newmtl _texture' + '\n' +
            'Ka 0 0 0' + '\n' +
            'Kd 0 0 0' + '\n' +
            'Tf 1 1 1' + '\n' +
            'Ni 1' + '\n' +
            'illum 4' + '\n' +
            'map_Kd ' + fileName + '.jpg' + '\n' +
            'map_Kn ' + fileName + '_normal.jpg' + '\n';

        fs.writeFile('viewer/' + outputFileName + '.mtl' , objMtlData , function(){});

		var objFileData = "";

		objFileData += 'mtllib ' + outputFileName + '.mtl' + '\n';

		baseMesh = JSON.parse(data);
		
		var vertices = [];
		var normals = [];
		var uvs = [];
		var faces = [];

        console.log("v:"+baseMesh.verts.length/3);
		for (var i = 0 ; i < baseMesh.verts.length ; i += 3)
		{
            objFileData += 'v ' +
                baseMesh.verts[i + 0].toFixed(vertexPrecision) + ' ' +
                baseMesh.verts[i + 1].toFixed(vertexPrecision) + ' ' +
                baseMesh.verts[i + 2].toFixed(vertexPrecision) + '\n';
		}
		console.log("uv:"+baseMesh.texcoords.length/2);
		for(var i = 0 ; i < baseMesh.texcoords.length ; i += 2)
		{
            objFileData += 'vt ' +
                baseMesh.texcoords[i + 0].toFixed(texPrecision) + ' ' +
                baseMesh.texcoords[i + 1].toFixed(texPrecision) + '\n';
		}

		objFileData += 'usemtl _texture' + '\n';
		console.log("face"+baseMesh.faces.length/3);
        for (var i = 0 ; i < baseMesh.faces.length ; i += 3)
        {
            objFileData += 'f ' +
                (baseMesh.faces[i + 0] + 1) + '/' + (i + 1) + ' ' +
                (baseMesh.faces[i + 1] + 1) + '/' + (i + 2) + ' ' +
                (baseMesh.faces[i + 2] + 1) + '/' + (i + 3) + '\n';
        }

        // Minimize the output json file
        fs.writeFile('viewer/' + outputFileName + '.obj' , objFileData , function(){
            obj2gltf('viewer/' + outputFileName + '.obj')
                .then(function(gltf) {
                    var data = Buffer.from(JSON.stringify(gltf));
                    fs.writeFileSync('viewer/' + outputFileName + '.gltf', data);
                });
        });

        // 
		loadCallback();
	});

    var deleteFolderRecursive = function(path)
    {
        var files = [];

        if( fs.existsSync(path) ) {

            files = fs.readdirSync(path);

            files.forEach(function(file,index){

                var curPath = path + "/" + file;

                if(fs.statSync(curPath).isDirectory()) { // recurse

                    deleteFolderRecursive(curPath);

                } else { // delete file

                    fs.unlinkSync(curPath);
                }
            });

            fs.rmdirSync(path);

        }
    };


    // setup pm mesh
	fs.readFile('data/' + fileName + '_out_pm.json', 'utf8' , function (err , data) {
		if (err)
		{
			return console.log(err);
		}

		pmMesh = JSON.parse(data);

		// Minimize pmMesh data
        for (var i = 0 ; i < pmMesh.splits.length ; ++i)
        {
            var fixedNum = 0.0;

            // Process S\TPosition
            var sp = [];
            for (var j = 0 ; j < pmMesh.splits[i].SPosition.length ; ++j)
            {
                fixedNum = parseFloat(pmMesh.splits[i].SPosition[j].toFixed(vertexPrecision));
                sp.push(fixedNum);
            }
            pmMesh.splits[i].SPosition = sp;

            var tp = [];
            for (var j = 0 ; j < pmMesh.splits[i].TPosition.length ; ++j)
            {
                fixedNum = parseFloat(pmMesh.splits[i].TPosition[j].toFixed(vertexPrecision));
                tp.push(fixedNum);
            }
            pmMesh.splits[i].TPosition = tp;

            // Process UVs
            var uvs = [];
            for (var j = 0 ; j < pmMesh.splits[i].UVs.length ; ++j)
            {
                fixedNum = parseFloat(pmMesh.splits[i].UVs[j].toFixed(texPrecision));
                uvs.push(fixedNum);
            }
            pmMesh.splits[i].UVs = uvs;
        }

        deleteFolderRecursive('viewer/pm/');
        fs.mkdirSync('viewer/pm/');

		var trunkCount = 20;

		//console.log(pmMesh.splits.length);

		for (var i = 0 ; i < pmMesh.splits.length ; i += trunkCount)
        {
            var trunkSplits = [];
            var count = Math.min(trunkCount , pmMesh.splits.length - i);
            for (var ti = 0 ; ti < count ; ++ti)
            {
                trunkSplits.push(pmMesh.splits[i + ti]);
            }

            //fs.writeFileSync('viewer/pm/pmmesh' + (i / trunkCount) + '.json' , JSON.stringify(trunkSplits , null, "\t"));
            fs.writeFileSync('viewer/pm/pmmesh' + (i / trunkCount) + '.json' , JSON.stringify(trunkSplits , null));
        }

        fs.writeFileSync('viewer/pm/desc.json' , JSON.stringify({splitCount: (i / trunkCount)} , null, "\t"));

		loadCallback();
	});
}

if (fileName)
{
    setupFile(fileName , function()
    {
        console.log('finish');
    });
}
else
{
    console.log('plz specify target model');
}


