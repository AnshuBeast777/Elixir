import type { FC } from "react" // Importing the Functional Component (FC) type from React
import { motion } from "framer-motion" // Importing motion from Framer Motion for animations

// Defining the Logo component as a functional component
const Logo: FC = () => {
  return (
    <motion.svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      initial={{ rotate: -90 }} // Initial state: rotated -90 degrees
      animate={{ rotate: 0 }} // Final state: rotated to 0 degrees
      transition={{ duration: 0.5 }} // Rotation animation duration: 0.5s
    >
      {/* Outer circle of the logo */}
      <motion.path
        d="M20 5C11.7157 5 5 11.7157 5 20C5 28.2843 11.7157 35 20 35C28.2843 35 35 28.2843 35 20C35 11.7157 28.2843 5 20 5Z"
        stroke="#8B5CF6" // Stroke color: purple
        strokeWidth="2" // Stroke width: 2px
        strokeLinecap="round" // Rounded stroke endings
        strokeLinejoin="round" // Rounded stroke joints
        initial={{ pathLength: 0 }} // Initial animation: stroke path not visible
        animate={{ pathLength: 1 }} // Final animation: stroke path fully visible
        transition={{ duration: 1 }} // Stroke animation duration: 1s
      />
      {/* Plus sign in the center of the logo */}
      <motion.path
        d="M20 13V27M13 20H27" // Vertical and horizontal line forming a plus sign
        stroke="#8B5CF6" // Stroke color: purple
        strokeWidth="2" // Stroke width: 2px
        strokeLinecap="round" // Rounded stroke endings
        strokeLinejoin="round" // Rounded stroke joints
        initial={{ pathLength: 0 }} // Initial animation: stroke path not visible
        animate={{ pathLength: 1 }} // Final animation: stroke path fully visible
        transition={{ duration: 1, delay: 0.5 }} // Stroke animation duration: 1s with a 0.5s delay
      />
    </motion.svg>
  )
}

export default Logo // Exporting the Logo component for use in other parts of the application
