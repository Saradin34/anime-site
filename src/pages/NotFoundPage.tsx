import { Link } from 'react-router-dom';
export default function NotFoundPage(){ return <div className="page empty"><h1>404</h1><p>Страница не найдена</p><Link className="primary-btn" to="/">На главную</Link></div>; }
