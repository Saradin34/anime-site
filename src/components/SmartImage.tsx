import clsx from 'clsx';
export default function SmartImage(props: React.ImgHTMLAttributes<HTMLImageElement>){ return <img {...props} className={clsx(props.className)} loading={props.loading||'lazy'} />; }
