type FittishLogoProps = {
  width?: number;
  height?: number;
  className?: string;
};

export default function FittishLogo({
  width = 32,
  height = 32,
  className = '',
}: FittishLogoProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 79 103"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M30.1817 25.8608C30.1817 25.8608 48.179 50.4732 74.0218 26.4761C74.0218 26.4761 91.251 60.627 58.1779 85.392C58.1779 85.392 23.259 64.0109 0.492462 102.159C0.492462 102.159 1.87789 61.2401 38.6425 52.0113C38.6425 52.0113 18.9522 48.935 3.72364 68.4704C3.72364 68.4704 2.18551 40.6269 30.1817 25.8608Z"
        fill="#2483FB"
      />
      <path
        d="M52.422 25.8631C59.5589 25.8631 65.3445 20.0775 65.3445 12.9406C65.3445 5.80367 59.5589 0.0180664 52.422 0.0180664C45.2851 0.0180664 39.4995 5.80367 39.4995 12.9406C39.4995 20.0775 45.2851 25.8631 52.422 25.8631Z"
        fill="#0CE73D"
      />
    </svg>
  );
}
