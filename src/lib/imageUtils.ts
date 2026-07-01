export function readFileAsDataURL(file: File): Promise<string>{ return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(String(r.result)); r.onerror=rej; r.readAsDataURL(file); }); }
export function validateImageFile(file: File){ return file.type.startsWith('image/'); }
export function dataUrlSizeKB(dataUrl: string){ return Math.round(dataUrl.length*0.75/1024); }
export async function squareCropResize(file: File, size=512){ return readFileAsDataURL(file); }
export async function fitResize(file: File, width=1280, height=420){ return readFileAsDataURL(file); }
