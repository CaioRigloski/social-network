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
import { Post } from "@/components/Post/Post"
import { API_ROUTES } from "@/lib/apiRoutes"


export default function Profile() {
  const session = useSession()

  const [ username, setUsername ] = useState<string | undefined>(session.data?.user?.username || undefined)
  const [ newUsername, setNewUsername ] = useState<string | null>(null)
  const [ inputImage, setInputImage ] = useState<File | undefined>(undefined)
  const [ pictureEditIsOpen, setPictureEditIsOpen ] = useState<boolean>(false)
  const [ usernameEditIsOpen, setusernameEditIsOpen] = useState<boolean>(false)

  const posts = useSWR(session.data && API_ROUTES.users(session.data?.user.id).posts, postsOfUserFetcher)

  const newProfilePictureForm = useForm<z.infer<typeof newProfilePictureSchema>>({
    resolver: zodResolver(newProfilePictureSchema),
    defaultValues: {
      picture: ""
    }
  })

  async function updateSessionData() {
    const { fileName } = await changeProfilePicture({ picture: await toDataUrl(inputImage as File) })
    const newSession = {
      ...session.data,
      user: {
        ...session.data?.user,
        profilePicture: fileName
      }
    }
    
    await session.update(newSession)
  }
 
  async function changeUsernameAndMutate() {
    newUsername && await changeUsername({newUsername: newUsername}).then(async () => {
      const newSession = {
        ...session.data,
        user: {
          ...session.data?.user,
          username: newUsername
        }
      }
      await session.update(newSession)
      setusernameEditIsOpen(false)
    })
  }

  return (
    <main className="standard:bg-secondary">
      <section>
        <div className="place-items-center p-5">
          <div className="relative group w-fit">
            {session.data?.user && <AvatarComponent user={session.data.user} className="h-[25rem] w-[25rem]"/>}
            <button type="button" onClick={() => setPictureEditIsOpen(true)} className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
              <CameraIcon className="text-white" />
            </button>
          </div>
          {
            usernameEditIsOpen ?
            <input type="text" placeholder={username} autoFocus onChange={e => setNewUsername(e.target.value)} onKeyDown={e => detectEnterKey(e) && newUsername && changeUsernameAndMutate()}/>
            :
            <p onClick={() => setusernameEditIsOpen(true)} className="text-3xl mt-3 cursor-pointer">{ username }</p>
          }
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
      <section className="p-5">
        <div className="flex flex-wrap justify-center standard:bg-secondary gap-5">
          {
            posts.data?.map(post =>
              <Post key={post.id} post={post} swrKey={session.data && API_ROUTES.users(session.data?.user.id).posts} className="standard:border-primary"/>
            )
          }
        </div>
      </section>
    </main>
  )
}