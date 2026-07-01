export type Achievement = { id: string; title: string; description: string; tier?: 'bronze'|'silver'|'gold'|'diamond' };
export const ACHIEVEMENTS: Achievement[] = [ { id:'first-watch', title:'Первый просмотр', description:'Начать смотреть аниме', tier:'bronze' }, { id:'collector', title:'Коллекционер', description:'Добавить 10 тайтлов', tier:'silver' } ];
export const TIER_STYLES: Record<string,string> = { bronze:'text-orange-300', silver:'text-slate-200', gold:'text-yellow-300', diamond:'text-cyan-300' };
