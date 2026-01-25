const Icon = ({ color = 'currentColor', size = 18, className, ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill={color}
      className={className}
      {...props}
    >
      <g transform="translate(256 0) scale(-1 1)">
        <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z M 256 128 L 128 128 L 0 0 L 128 0 Z" />
      </g>
    </svg>
  )
}

export default Icon
