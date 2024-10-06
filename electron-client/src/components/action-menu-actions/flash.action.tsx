
import { useState, useMemo } from "react"
import { Input } from "../../shadcn/input"

export default function FlashAction() {
   const [searchTerm, setSearchTerm] = useState("")
   const [selectedIndex, setSelectedIndex] = useState(0)
   const names = [
      "Alice Johnson",
      "Bob Smith",
      "Charlie Davis",
      "David Lee",
      "Emily Chen",
      "Frank Patel",
      "Grace Nguyen",
      "Henry Gonzalez",
      "Isabella Hernandez",
      "Jacob Ramirez",
   ]
   const filteredNames = useMemo(() => {
      return names.filter((name) => name.toLowerCase().includes(searchTerm.toLowerCase()))
   }, [searchTerm])
   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowUp") {
         setSelectedIndex((prevIndex) => (prevIndex === 0 ? filteredNames.length - 1 : prevIndex - 1))
      } else if (e.key === "ArrowDown") {
         setSelectedIndex((prevIndex) => (prevIndex === filteredNames.length - 1 ? 0 : prevIndex + 1))
      } else if (e.key === "Enter") {
         setShowInput(true)
      }
   }
   const [showInput, setShowInput] = useState(false)
   const [message, setMessage] = useState("")
   return (
      <div className="flex flex-col items-center justify-center h-screen">
         <div className="relative w-full max-w-md">
            <Input
               type="text"
               placeholder="Search for a name..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               onKeyDown={handleKeyDown}
               className="w-full rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
            {filteredNames.length > 0 && (
               <ul className="absolute z-10 w-full mt-2 bg-white rounded-lg shadow-lg">
                  {filteredNames.map((name, index) => (
                     <li
                        key={name}
                        className={`px-4 py-2 cursor-pointer hover:bg-muted ${index === selectedIndex ? "bg-muted" : ""}`}
                        onClick={() => {
                           setSelectedIndex(index)
                           setShowInput(true)
                        }}
                     >
                        {name}
                     </li>
                  ))}
               </ul>
            )}
         </div>
         {showInput && (
            <div className="mt-4 w-full max-w-md">
               <Input
                  type="text"
                  placeholder={`Message ${filteredNames[selectedIndex]}`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                     if (e.key === "Enter") {
                        console.log(`Sending message to ${filteredNames[selectedIndex]}: ${message}`)
                        setMessage("")
                        setShowInput(false)
                     }
                  }}
                  className="w-full rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
               />
            </div>
         )}
      </div>
   )
}