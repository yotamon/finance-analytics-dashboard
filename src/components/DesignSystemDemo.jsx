import React, { useState } from "react";
import { Box, Button, Card, CardHeader, CardBody, CardFooter, Text, useTheme } from "../design-system";

/**
 * Design System Demo Component
 *
 * Shows examples of various components from the design system
 */
const DesignSystemDemo = () => {
	const { isDark, toggleTheme } = useTheme();
	const [count, setCount] = useState(0);

	return (
		<Box p="2rem" style={{ maxWidth: "1200px", margin: "0 auto" }}>
			<Text variant="h1" mb="1rem">
				Design System Demo
			</Text>
			<Text variant="subtitle1" mb="2rem">
				This component demonstrates the design system components with support for{" "}
				<Text as="span" style={{ fontWeight: "bold" }}>
					{isDark ? "dark" : "light"}
				</Text>{" "}
				mode.
			</Text>

			{/* Theme toggle */}
			<Card mb="2rem">
				<CardBody>
					<Box display="flex" alignItems="center" justifyContent="space-between">
						<Text variant="h4" mb="0">
							Current Theme: {isDark ? "Dark" : "Light"}
						</Text>
						<Button
							variant="primary"
							onClick={toggleTheme}
							leftIcon={
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									{isDark ? (
										// Sun icon
										<path
											d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									) : (
										// Moon icon
										<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
									)}
								</svg>
							}>
							Switch to {isDark ? "Light" : "Dark"} Mode
						</Button>
					</Box>
				</CardBody>
			</Card>

			{/* Button examples */}
			<Text variant="h2" mb="1rem">
				Buttons
			</Text>
			<Card mb="2rem">
				<CardHeader>
					<Text variant="h4" mb="0">
						Button Variants
					</Text>
				</CardHeader>
				<CardBody>
					<Box display="flex" flexWrap="wrap" gap="1rem" mb="2rem">
						<Button variant="primary">Primary</Button>
						<Button variant="secondary">Secondary</Button>
						<Button variant="tertiary">Tertiary</Button>
						<Button variant="success">Success</Button>
						<Button variant="danger">Danger</Button>
						<Button variant="ghost">Ghost</Button>
					</Box>

					<Text variant="h4" mb="1rem">
						Button Sizes
					</Text>
					<Box display="flex" flexWrap="wrap" gap="1rem" mb="2rem" alignItems="center">
						<Button size="xs">Extra Small</Button>
						<Button size="sm">Small</Button>
						<Button size="md">Medium</Button>
						<Button size="lg">Large</Button>
						<Button size="xl">Extra Large</Button>
					</Box>

					<Text variant="h4" mb="1rem">
						Button States
					</Text>
					<Box display="flex" flexWrap="wrap" gap="1rem" mb="2rem">
						<Button isDisabled>Disabled</Button>
						<Button isLoading>Loading</Button>
						<Button leftIcon={<span>👍</span>}>With Left Icon</Button>
						<Button rightIcon={<span>🚀</span>}>With Right Icon</Button>
						<Button isFullWidth>Full Width Button</Button>
					</Box>

					<Text variant="h4" mb="1rem">
						Interactive Example
					</Text>
					<Box display="flex" alignItems="center" gap="1rem">
						<Button variant="secondary" onClick={() => setCount(count - 1)}>
							-
						</Button>
						<Text variant="h4" mb="0">
							{count}
						</Text>
						<Button variant="primary" onClick={() => setCount(count + 1)}>
							+
						</Button>
					</Box>
				</CardBody>
			</Card>

			{/* Card examples */}
			<Text variant="h2" mb="1rem">
				Cards
			</Text>
			<Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap="1rem" mb="2rem">
				<Card variant="default" padding="md">
					<CardHeader>
						<Text variant="h4" mb="0">
							Default Card
						</Text>
					</CardHeader>
					<CardBody>
						<Text>This is a default card with a header and body.</Text>
					</CardBody>
					<CardFooter>
						<Button variant="tertiary" size="sm">
							Learn More
						</Button>
					</CardFooter>
				</Card>

				<Card variant="outline" padding="md">
					<CardHeader>
						<Text variant="h4" mb="0">
							Outline Card
						</Text>
					</CardHeader>
					<CardBody>
						<Text>This is an outline card with a header and body.</Text>
					</CardBody>
					<CardFooter>
						<Button variant="tertiary" size="sm">
							Learn More
						</Button>
					</CardFooter>
				</Card>

				<Card variant="filled" padding="md">
					<CardHeader>
						<Text variant="h4" mb="0">
							Filled Card
						</Text>
					</CardHeader>
					<CardBody>
						<Text>This is a filled card with a header and body.</Text>
					</CardBody>
					<CardFooter>
						<Button variant="tertiary" size="sm">
							Learn More
						</Button>
					</CardFooter>
				</Card>

				<Card variant="elevated" padding="md" isHoverable>
					<CardHeader>
						<Text variant="h4" mb="0">
							Elevated Card (Hoverable)
						</Text>
					</CardHeader>
					<CardBody>
						<Text>This is an elevated card with hover effects. Try hovering over it!</Text>
					</CardBody>
					<CardFooter>
						<Button variant="tertiary" size="sm">
							Learn More
						</Button>
					</CardFooter>
				</Card>
			</Box>

			{/* Typography examples */}
			<Text variant="h2" mb="1rem">
				Typography
			</Text>
			<Card mb="2rem">
				<CardBody>
					<Text variant="h1">Heading 1</Text>
					<Text variant="h2">Heading 2</Text>
					<Text variant="h3">Heading 3</Text>
					<Text variant="h4">Heading 4</Text>
					<Text variant="h5">Heading 5</Text>
					<Text variant="h6">Heading 6</Text>
					<Text variant="subtitle1" mb="0.5rem">
						Subtitle 1
					</Text>
					<Text variant="subtitle2" mb="0.5rem">
						Subtitle 2
					</Text>
					<Text variant="body1" mb="0.5rem">
						Body 1 - Regular paragraph text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies aliquam, nunc nisi aliquet nunc.
					</Text>
					<Text variant="body2" mb="0.5rem">
						Body 2 - Smaller paragraph text. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
					</Text>
					<Text variant="caption" mb="0.5rem">
						Caption text - Small text often used for captions or labels
					</Text>
					<Text variant="overline" mb="0.5rem">
						OVERLINE TEXT
					</Text>
					<Text variant="label" mb="0.5rem">
						Label Text
					</Text>

					<Text variant="body1" mb="0.5rem" truncate>
						Truncated text example - This text is too long and will be truncated with an ellipsis when it reaches the end of its container instead of wrapping to the next line.
					</Text>
				</CardBody>
			</Card>

			{/* Box examples */}
			<Text variant="h2" mb="1rem">
				Box Layout
			</Text>
			<Card mb="2rem">
				<CardBody>
					<Text variant="h4" mb="1rem">
						Flex Layout
					</Text>
					<Box display="flex" justifyContent="space-between" p="1rem" mb="1rem" bg="var(--color-bg-tertiary)" borderRadius="var(--border-radius-md)">
						<Box p="1rem" bg="var(--color-primary-100)" color="var(--color-primary-700)" borderRadius="var(--border-radius-sm)">
							Item 1
						</Box>
						<Box p="1rem" bg="var(--color-primary-100)" color="var(--color-primary-700)" borderRadius="var(--border-radius-sm)">
							Item 2
						</Box>
						<Box p="1rem" bg="var(--color-primary-100)" color="var(--color-primary-700)" borderRadius="var(--border-radius-sm)">
							Item 3
						</Box>
					</Box>

					<Text variant="h4" mb="1rem">
						Grid Layout
					</Text>
					<Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap="1rem" p="1rem" bg="var(--color-bg-tertiary)" borderRadius="var(--border-radius-md)">
						<Box p="1rem" bg="var(--color-primary-100)" color="var(--color-primary-700)" borderRadius="var(--border-radius-sm)">
							Grid 1
						</Box>
						<Box p="1rem" bg="var(--color-primary-100)" color="var(--color-primary-700)" borderRadius="var(--border-radius-sm)">
							Grid 2
						</Box>
						<Box p="1rem" bg="var(--color-primary-100)" color="var(--color-primary-700)" borderRadius="var(--border-radius-sm)">
							Grid 3
						</Box>
						<Box p="1rem" bg="var(--color-primary-100)" color="var(--color-primary-700)" borderRadius="var(--border-radius-sm)">
							Grid 4
						</Box>
						<Box p="1rem" bg="var(--color-primary-100)" color="var(--color-primary-700)" borderRadius="var(--border-radius-sm)">
							Grid 5
						</Box>
						<Box p="1rem" bg="var(--color-primary-100)" color="var(--color-primary-700)" borderRadius="var(--border-radius-sm)">
							Grid 6
						</Box>
					</Box>
				</CardBody>
			</Card>
		</Box>
	);
};

export default DesignSystemDemo;
