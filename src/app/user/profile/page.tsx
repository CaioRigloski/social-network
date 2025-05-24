'use client'

import useSWR from "swr"
import { useSession } from "next-auth/react"
import { postsOfUserFetcher } from "@/lib/swr"
import { detectEnterKey, imageFormats, path, toDataUrl } from "@/lib/utils"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { newProfilePictureSchema } from "@/lib/zod"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import Image from "next/image"
import { changeProfilePicture, changeUsername } from "./actions"
import { AvatarComponent } from "@/components/Avatar/Avatar"
import { CameraIcon } from "@radix-ui/react-icons"


export default function Profile() {
  const { data, update } = useSession()

  const [ username, setUsername ] = useState<string | undefined>(data?.user?.username || undefined)
  const [ newUsername, setNewUsername ] = useState<string | null>(null)
  const [ inputImage, setInputImage ] = useState<File | undefined>(undefined)
  const [ pictureEditIsOpen, setPictureEditIsOpen ] = useState<boolean>(false)
  const [ usernameEditIsOpen, setusernameEditIsOpen] = useState<boolean>(false)

  const posts = useSWR(`/api/user/get-posts?id=${data?.user?.id}`, postsOfUserFetcher)

  const newProfilePictureForm = useForm<z.infer<typeof newProfilePictureSchema>>({
    resolver: zodResolver(newProfilePictureSchema),
    defaultValues: {
      picture: ""
    }
  })

  async function updateSessionData() {
    const { fileName } = await changeProfilePicture({ picture: await toDataUrl(inputImage as File) })
    const newSession = {
      ...data,
      user: {
        ...data?.user,
        profilePicture: fileName
      }
    }
    
    await update(newSession)
  }
 
  async function changeUsernameAndMutate() {
    newUsername && await changeUsername({newUsername: newUsername}).then(async () => {
      const newSession = {
        ...data,
        user: {
          ...data?.user,
          username: newUsername
        }
      }
      await update(newSession)
      setusernameEditIsOpen(false)
    })
  }

  return (
    <main>
      <section>
        {
          usernameEditIsOpen ?
          <input type="text" placeholder={username} autoFocus onChange={e => setNewUsername(e.target.value)} onKeyDown={e => detectEnterKey(e) && newUsername && changeUsernameAndMutate()}/>
          :
          <p onClick={() => setusernameEditIsOpen(true)}>{username}</p>
        }
        
        <div className="relative group w-fit">
          {data?.user && <AvatarComponent user={data.user}/>}
          <button type="button" onClick={() => setPictureEditIsOpen(true)} className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
            <CameraIcon className="text-white text-2xl" />
          </button>
        </div>

        <Dialog open={pictureEditIsOpen} onOpenChange={() => setPictureEditIsOpen(false)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit profile picture</DialogTitle>
            </DialogHeader>
            <Form {...newProfilePictureForm}>
              <form onSubmit={newProfilePictureForm.handleSubmit(async() => await updateSessionData())}>
                <FormField
                  control={newProfilePictureForm.control}
                  name="picture"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Picture</FormLabel>
                      <FormControl>
                        <Input type="file" accept="image/*" {...field} onChange={e => setInputImage(e.target.files?.[0])}/>
                      </FormControl>
                    </FormItem>
                  )}
                  >
                </FormField>
                {inputImage && <Image src={URL.createObjectURL(inputImage)} width={500} height={500} alt="image"/>}
                <DialogFooter>
                  <Button type="submit">Save</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </section>
      <section>
        <div>
          {
            posts.data?.map(post =>
              <img key={post.id} alt="post picture" width={0} height={0} src={`/images/${path.posts}/${post.picture}.jpeg`} className="w-80 h-auto"/>
            )
          }
        </div>
      </section>
    </main>
  )
}