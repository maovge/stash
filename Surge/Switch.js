// δ»£ηεζ’ππποΌ https://raw.githubusercontent.com/jnlaoshu/MySelf/master/Surge/Switch.js
// ππ«π¨π¦οΌ https://raw.githubusercontent.com/fishingworld/something/main/groupPanel.js
// ππ©πππ­ποΌ2022.05.03 10:00

/*
[Script]
δ»£ηεζ’ = type=generic,timeout=10,script-path=https://raw.githubusercontent.com/jnlaoshu/MySelf/master/Surge/Switch.js,argument=icon=network&color=#86abee&group=ππ«π¨π±π²
  ε―ΉεΊεζ°οΌ
    iconοΌεΎζ 
    colorοΌεΎζ ι’θ²
    groupοΌη­η₯η»εη§°
	
[Panel]
δ»£ηεζ’ = script-name=δ»£ηεζ’,title=δ»£ηεζ’,content=θ―·ε·ζ°,update-interval=1
*/

;(async () => {

let params = getParams($argument);
let group=params.group;
let proxy = await httpAPI("/v1/policy_groups");
let groupName = (await httpAPI("/v1/policy_groups/select?group_name="+encodeURIComponent(group)+"")).policy;
var proxyName= [];
let arr = proxy[""+group+""];
let allGroup = [];

for (var key in proxy){
   allGroup.push(key)
    }

for (let i = 0; i < arr.length; ++i) {
proxyName.push(arr[i].name);
}

let index;

for(let i = 0;i < proxyName.length; ++i) {
	if(groupName==proxyName[i]){
index=i
	}
};

if($trigger == "button"){
index += 1;

if(index>arr.length-1){
	index = 0;
	}
$surge.setSelectGroupPolicy(group, proxyName[index]);

};

let name =proxyName[index];
let secondName;
let rootName = name;
if(allGroup.includes(rootName)==true){
	secondName = (await httpAPI("/v1/policy_groups/select?group_name="+encodeURIComponent(rootName)+"")).policy;
	name = name + ' β ' + secondName
}

while(allGroup.includes(rootName)==true){
	rootName = (await httpAPI("/v1/policy_groups/select?group_name="+encodeURIComponent(rootName)+"")).policy;
}

if(arr[index].isGroup==true && secondName!= rootName){
name=name + ' β ' + rootName;
}

    $done({
      title:group,
      content:name,
      icon: params.icon,
		"icon-color":params.color
    });
})();

function httpAPI(path = "", method = "GET", body = null) {
    return new Promise((resolve) => {
        $httpAPI(method, path, body, (result) => {
            resolve(result);
        });
    });
};

function getParams(param) {
  return Object.fromEntries(
    $argument
      .split("&")
      .map((item) => item.split("="))
      .map(([k, v]) => [k, decodeURIComponent(v)])
  );
}
