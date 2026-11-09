export function parseCoordinates(input){
 const s=input.trim().toUpperCase().replace(/[−–]/g,'-').replace(/[′’]/g,"'").replace(/[″”“]/g,'"').replace(/º/g,'°');
 if(!s)throw Error('Paste coordinates for your site.');
 let lat,lon;const dec='[+-]?\\d{1,3}(?:\\.\\d+)?';
 const decimal=new RegExp('^('+dec+')(?:\\s*[,;]\\s*|\\s+)('+dec+')$').exec(s);
 if(decimal){lat=Number(decimal[1]);lon=Number(decimal[2]);}
 else{
  const angle=new RegExp('([+-]?\\d{1,3}(?:\\.\\d+)?)(?:\\s*°(?:\\s*(\\d{1,2}(?:\\.\\d+)?)\\s*\'(?:\\s*(\\d{1,2}(?:\\.\\d+)?)\\s*")?)?)?\\s*([NSEW])','g');
  const matches=[...s.matchAll(angle)];
  if(matches.length!==2||s.replace(angle,'').replace(/[\s,;]/g,''))throw Error('Use a latitude and longitude pair, such as 8.491833, 124.757686.');
  for(const [,deg,mins,secs,dir] of matches){
   if(Number(deg)<0||Number(mins)>=60||Number(secs)>=60)throw Error('Check the coordinate signs, minutes and seconds.');
   const value=(+deg+(+mins||0)/60+(+secs||0)/3600)*('SW'.includes(dir)?-1:1);
   if('NS'.includes(dir)){if(lat!==undefined)throw Error('Include one latitude and one longitude.');lat=value;}
   else{if(lon!==undefined)throw Error('Include one latitude and one longitude.');lon=value;}
  }
 }
 if(!(lat>4&&lat<11&&lon>119&&lon<127))throw Error('Choose a site within the Mindanao region (4–11° N, 119–127° E).');
 return {lat,lon};
}
