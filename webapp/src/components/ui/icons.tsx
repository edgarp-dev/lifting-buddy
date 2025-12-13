interface IconProps {
	size?: number;
	className?: string;
}

export function DumbbellIcon({ size = 24, className = "" }: IconProps) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			aria-hidden="true"
		>
			<path
				d="M6.5 6L6.5 18M17.5 6V18M3 9L3 15M21 9V15M6.5 12L17.5 12M3 10.5L6 10.5M3 13.5L6 13.5M18 10.5H21M18 13.5H21"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

export function CalendarIcon({ size = 24, className = "" }: IconProps) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			aria-hidden="true"
		>
			<rect
				x="3"
				y="4"
				width="18"
				height="18"
				rx="2"
				stroke="currentColor"
				strokeWidth="2"
			/>
			<path
				d="M16 2V6M8 2V6M3 10H21"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
			/>
		</svg>
	);
}

export function ChevronRightIcon({ size = 24, className = "" }: IconProps) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			aria-hidden="true"
		>
			<path
				d="M9 18L15 12L9 6"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

export function UserIcon({ size = 24, className = "" }: IconProps) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			aria-hidden="true"
		>
			<circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
			<path
				d="M6 21C6 17.134 8.686 14 12 14C15.314 14 18 17.134 18 21"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
			/>
		</svg>
	);
}

export function RobotIcon({ size = 24, className = "" }: IconProps) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			aria-hidden="true"
		>
			<rect
				x="5"
				y="9"
				width="14"
				height="11"
				rx="2"
				stroke="currentColor"
				strokeWidth="2"
			/>
			<circle cx="9" cy="14" r="1.5" fill="currentColor" />
			<circle cx="15" cy="14" r="1.5" fill="currentColor" />
			<path
				d="M9 17H15"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
			/>
			<path
				d="M12 9V6M12 6L10 8M12 6L14 8"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M5 12H3M21 12H19"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
			/>
		</svg>
	);
}

export function ArrowLeftIcon({ size = 24, className = "" }: IconProps) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			aria-hidden="true"
		>
			<path
				d="M19 12H5M5 12L12 19M5 12L12 5"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

export function TrashIcon({ size = 24, className = "" }: IconProps) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			aria-hidden="true"
		>
			<path
				d="M3 6H5H21"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

export function FilterIcon({ size = 24, className = "" }: IconProps) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			aria-hidden="true"
		>
			<path
				d="M4 6H20M7 12H17M10 18H14"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

export function SearchIcon({ size = 24, className = "" }: IconProps) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			aria-hidden="true"
		>
			<circle
				cx="11"
				cy="11"
				r="8"
				stroke="currentColor"
				strokeWidth="2"
			/>
			<path
				d="M21 21L16.65 16.65"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
			/>
		</svg>
	);
}

export function XIcon({ size = 24, className = "" }: IconProps) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			aria-hidden="true"
		>
			<path
				d="M18 6L6 18M6 6L18 18"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

export function ChevronDownIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			width="20"
			height="20"
			viewBox="0 0 20 20"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M5 7.5L10 12.5L15 7.5"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}
