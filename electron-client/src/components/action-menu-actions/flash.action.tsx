
import { useState, useMemo, useEffect } from "react"
import { Input } from "../../shadcn/input"
import { Form, FormControl, FormField, FormItem, FormMessage } from "../../shadcn/form"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { sendFlashSchema } from "../../schemas/send-flash-schema"
import { parseClients } from "../../lib/client-parser"
import { useFilteredClients } from "./filtered-clients"
import { useLocalStorage } from "usehooks-ts"
import { LocalStorageKeys } from "../../types/local-storage-keys.enum"

export default function FlashAction() {
   const [searchTerm, setSearchTerm] = useState("")
   const [selectedIndex, setSelectedIndex] = useState(0)
   const [showInput, setShowInput] = useState(false)
   const [clients, setClients] = useState<Client[] | null>(null)
   const [loadingNames, setLoadingNames] = useState(false)
   const [yourName, setYourName] = useState("")
   const [holdShift, setHoldShift] = useState(false)

   const filteredClients = useFilteredClients(clients, yourName, searchTerm);
   const [flash] = useLocalStorage(LocalStorageKeys.FLASH, false);
   const [lastFlashFrom] = useLocalStorage(LocalStorageKeys.LAST_FLASH_FROM, "");

   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "ArrowUp") {
         setSelectedIndex((prevIndex) => (prevIndex === 0 ? filteredClients.length - 1 : prevIndex - 1))
      } else if (e.key === "ArrowDown") {
         setSelectedIndex((prevIndex) => (prevIndex === filteredClients.length - 1 ? 0 : prevIndex + 1))
      } else if (e.key === "Enter") {
         if (!filteredClients[selectedIndex]) {
            console.log("No name selected");
            return
         }

         setShowInput(true)
         setSearchTerm("")
      } else if (e.key === "Shift") {
         setHoldShift(true)
      }
   }

   const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Shift") {
         setHoldShift(false)
      }
   }

   const handleNameClick = (index: number) => {
      setSelectedIndex(index)
      setShowInput(true)
      setSearchTerm("")
   }
   const handleSendMessage = (text: string) => {
      const client = filteredClients[selectedIndex];

      window.electronAPI.sendMessage(client.name, text);

      window.electronAPI.closeActionMenu();

      console.log(`Sending message to ${client.name}: ${text}`)
      setShowInput(false)
   }

   useEffect(() => {
      window.electronAPI.getMyName().then((name) => {
         setYourName(name)
      })
      setLoadingNames(true)
      window.electronAPI.getRawClients().then((rawClients) => {
         const clients = parseClients(rawClients)

         if (clients.length > 0) {
            setClients(clients)
         }
      }).catch((error) => {
         console.error(error)
      }).finally(() => {
         setLoadingNames(false)
      })
   }, [])

   useEffect(() => {
      if (flash && lastFlashFrom) {
         setSelectedIndex(filteredClients.findIndex((client) => client.name === lastFlashFrom))
         setShowInput(true)
      }
   }, [filteredClients, flash])


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
                  onKeyUp={handleKeyUp}
                  className="w-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
               />
               {
                  loadingNames && (
                     <div>Loading names...</div>
                  )
               }
               {filteredClients.length > 0 && !showInput && (
                  <ul className="relative z-10 w-full mt-2 bg-white shadow-lg rounded-lg">
                     {filteredClients.map((client, index) => (
                        <li
                           key={client.name}
                           className={`px-4 py-2 cursor-pointer justify-between flex flex-row items-center hover:bg-muted ${index === selectedIndex ? "bg-muted" : ""} ${index === 0 ? "rounded-t-lg" : ""} ${index === filteredClients.length - 1 ? "rounded-b-lg" : ""}`}
                           onClick={() => handleNameClick(index)}
                        >
                           <p>{client.name}</p>

                           {holdShift
                              ? <p>v{client.version}</p>
                              : (!!client.streak && <p className="text-xs">{client.timeSinceLastMessageInSeconds < 60 * 60 * 12 ? "🔥" : "⏳"} {client.streak}</p>)}
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
                                    placeholder={`Message ${filteredClients[selectedIndex].name}`}
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