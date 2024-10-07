
import { useState, useMemo, useEffect } from "react"
import { Input } from "../../shadcn/input"
import { Form, FormControl, FormField, FormItem, FormMessage } from "../../shadcn/form"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { sendFlashSchema } from "../../schemas/send-flash-schema"

export default function FlashAction() {
   const [searchTerm, setSearchTerm] = useState("")
   const [selectedIndex, setSelectedIndex] = useState(0)
   const [showInput, setShowInput] = useState(false)
   const [names, setNames] = useState<string[] | null>(null)
   const [loadingNames, setLoadingNames] = useState(false)
   const [yourName, setYourName] = useState("")

   const filteredNames = useMemo(() => {
      return names?.filter(name => name !== yourName).filter((name) => name.toLowerCase().includes(searchTerm.toLowerCase())) || []
   }, [searchTerm, names, yourName])

   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowUp") {
         setSelectedIndex((prevIndex) => (prevIndex === 0 ? filteredNames.length - 1 : prevIndex - 1))
      } else if (e.key === "ArrowDown") {
         setSelectedIndex((prevIndex) => (prevIndex === filteredNames.length - 1 ? 0 : prevIndex + 1))
      } else if (e.key === "Enter") {
         if (!filteredNames[selectedIndex]) {
            console.log("No name selected");
            return
         }

         setShowInput(true)
         setSearchTerm("")
      }
   }
   const handleNameClick = (index: number) => {


      setSelectedIndex(index)
      setShowInput(true)
      setSearchTerm("")
   }
   const handleSendMessage = (text: string) => {

      const name = filteredNames[selectedIndex];

      window.electronAPI.sendMessage(name, text);

      window.electronAPI.closeActionMenu();

      console.log(`Sending message to ${name}: ${text}`)
      setShowInput(false)
   }

   useEffect(() => {
      window.electronAPI.getMyName().then((name) => {
         setYourName(name)
      })
      setLoadingNames(true)
      window.electronAPI.getNames().then((names) => {
         console.log({ names })
         setNames(names.split(","))
      }).catch((error) => {
         console.error(error)
      }).finally(() => {
         setLoadingNames(false)
      })
   }, [])


   const form = useForm<z.infer<typeof sendFlashSchema>>({
      resolver: zodResolver(sendFlashSchema),
      defaultValues: {
         text: "",
      },
   })

   function onSubmit(values: z.infer<typeof sendFlashSchema>) {
      handleSendMessage(values.text)
   }

   return (
      <div className="flex flex-col items-center justify-center">
         {!showInput && (
            <div className="relative w-full max-w-md">
               <Input
                  type="text"
                  placeholder="Search for a name..."
                  value={searchTerm}
                  autoFocus
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
               />
               {
                  loadingNames && (
                     <div>Loading names...</div>
                  )
               }
               {filteredNames.length > 0 && !showInput && (
                  <ul className="relative z-10 w-full mt-2 bg-white shadow-lg rounded-lg">
                     {filteredNames.map((name, index) => (
                        <li
                           key={name}
                           className={`px-4 py-2 cursor-pointer hover:bg-muted ${index === selectedIndex ? "bg-muted" : ""} ${index === 0 ? "rounded-t-lg" : ""} ${index === filteredNames.length - 1 ? "rounded-b-lg" : ""}`}
                           onClick={() => handleNameClick(index)}
                        >
                           {name}
                        </li>
                     ))}
                  </ul>
               )}
            </div>
         )}
         {showInput && (
            <div className="w-full max-w-md">
               <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" onKeyDown={(e) => {
                     if (e.key === 'Enter') {
                        form.handleSubmit(onSubmit)(e);
                     }
                  }}>
                     <FormField
                        control={form.control}
                        name="text"
                        render={({ field }) => (
                           <FormItem>
                              <FormControl>
                                 <Input
                                    type="text"
                                    placeholder={`Message ${filteredNames[selectedIndex]}`}
                                    value={field.value}
                                    autoFocus
                                    onChange={(e) => field.onChange(e.target.value)}

                                    className="w-full rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                 />
                              </FormControl>
                              <FormMessage />
                           </FormItem>
                        )}
                     />
                  </form>
               </Form>

            </div>
         )}
      </div>
   )
}