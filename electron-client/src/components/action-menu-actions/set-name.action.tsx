import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../../shadcn/form"
import { Input } from "../../shadcn/input"
import { setNameSchema } from "../../schemas/set-name-schema"

export default function SetNameAction() {
  const form = useForm<z.infer<typeof setNameSchema>>({
    resolver: zodResolver(setNameSchema),
    defaultValues: {
      name: "",
    },
  })

  function onSubmit(values: z.infer<typeof setNameSchema>) {
    console.log(values)
    window.electronAPI.setName(values.name)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" onKeyDown={(e) => {
        if (e.key === 'Enter') {
          form.handleSubmit(onSubmit)(e);
        }
      }}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Enter your name" {...field} autoFocus />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}