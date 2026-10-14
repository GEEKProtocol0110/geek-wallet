export function baseUnits(value:unknown):string {
 if(typeof value==='number'){if(!Number.isSafeInteger(value)||value<0)throw new Error('Invalid amount');return String(value);}
 if(typeof value!=='string'||! /^(0|[1-9]\d{0,29})$/.test(value)) throw new Error('Invalid amount');
 return value;
}
export function displayUnits(value:string,decimals=8):string {
 if(!Number.isSafeInteger(decimals)||decimals<0||decimals>18)throw new Error('Invalid decimals');
 if(decimals===0)return baseUnits(value).replace(/\B(?=(\d{3})+(?!\d))/g,',');
 const units=baseUnits(value).padStart(decimals+1,'0');const whole=units.slice(0,-decimals).replace(/\B(?=(\d{3})+(?!\d))/g,',');const fraction=units.slice(-decimals).replace(/0+$/,'');return whole+(fraction?'.'+fraction:'');
}
