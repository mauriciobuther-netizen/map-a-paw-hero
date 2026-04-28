import { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number | string };

/**
 * DogIcon — silhueta de cabeça de cachorro com orelhas caídas.
 * Estilo line-art coerente com Lucide (stroke=currentColor, fill=none).
 */
export function DogIcon({ size = 24, strokeWidth = 1.8, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth as number}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {/* Orelhas caídas */}
      <path d="M5 5.5c-1.4 1.4-1.6 4-0.6 6.2" />
      <path d="M19 5.5c1.4 1.4 1.6 4 0.6 6.2" />
      {/* Cabeça arredondada */}
      <path d="M5.2 11.8c0-3.6 3-6.3 6.8-6.3s6.8 2.7 6.8 6.3c0 4.2-3 7.7-6.8 7.7s-6.8-3.5-6.8-7.7Z" />
      {/* Olhos */}
      <circle cx="9.3" cy="12.4" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="14.7" cy="12.4" r="0.9" fill="currentColor" stroke="none" />
      {/* Focinho */}
      <path d="M10.4 15.6c.5.5 1 .7 1.6.7s1.1-.2 1.6-.7" />
      <ellipse cx="12" cy="14.6" rx="0.9" ry="0.7" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * CatIcon — silhueta de cabeça de gato com orelhas pontudas.
 */
export function CatIcon({ size = 24, strokeWidth = 1.8, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth as number}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {/* Contorno: orelhas pontudas + cabeça */}
      <path d="M5 5.2 7.8 9.4c1.2-.6 2.7-1 4.2-1s3 .4 4.2 1L19 5.2c.4-.6 1.3-.3 1.3.4v6.7c0 4.2-3.7 7.7-8.3 7.7S3.7 16.5 3.7 12.3V5.6c0-.7.9-1 1.3-.4Z" />
      {/* Olhos */}
      <circle cx="9.3" cy="12.6" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="14.7" cy="12.6" r="0.9" fill="currentColor" stroke="none" />
      {/* Focinho */}
      <path d="M11 15.2c.3.3.6.5 1 .5s.7-.2 1-.5" />
      <path d="M12 14.4v.8" />
      <ellipse cx="12" cy="14.2" rx="0.7" ry="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
