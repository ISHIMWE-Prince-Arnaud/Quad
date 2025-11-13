import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ImageIcon, Hash, MapPin, Calendar } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'

// Form schema
const createPostSchema = z.object({
  content: z.string().min(1, 'Post content is required').max(500, 'Post content must be less than 500 characters'),
  visibility: z.enum(['public', 'friends', 'private']),
  tags: z.string().optional(),
  location: z.string().optional(),
  scheduledFor: z.string().optional(),
})

type CreatePostFormData = z.infer<typeof createPostSchema>

interface CreatePostFormProps {
  onSubmit?: (data: CreatePostFormData) => void
  isLoading?: boolean
}

export function CreatePostForm({ onSubmit, isLoading = false }: CreatePostFormProps) {
  const { user } = useAuthStore()
  
  const form = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      content: '',
      visibility: 'public',
      tags: '',
      location: '',
      scheduledFor: '',
    },
  })

  const handleSubmit = (data: CreatePostFormData) => {
    console.log('Form submitted:', data)
    onSubmit?.(data)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.profileImage} />.            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {user?.firstName?.charAt(0) || user?.username?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold">Create Post</h3>
            <p className="text-sm text-muted-foreground">Share what's on your mind</p>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            
            {/* Post Content */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What's happening?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your thoughts..."
                      className="min-h-[120px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {(field.value || '').length}/500 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Post Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Visibility */}
              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="friends">Friends Only</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tags */}
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="technology, react, coding"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Separate tags with commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </div>

            {/* Additional Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Location */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location (Optional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Add location"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Schedule */}
              <FormField
                control={form.control}
                name="scheduledFor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Schedule (Optional)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="datetime-local"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </div>

            {/* Media Options */}
            <div className="border-t pt-4">
              <Label className="text-sm font-medium mb-3 block">Add to your post</Label>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" className="gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Photo/Video
                </Button>
                <Button type="button" variant="outline" size="sm" className="gap-2">
                  <Hash className="h-4 w-4" />
                  Poll
                </Button>
                <Button type="button" variant="outline" size="sm" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  Event
                </Button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                {form.formState.errors.content && (
                  <span className="text-destructive">Please fix the errors above</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => form.reset()}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading || !form.formState.isValid}
                  className="min-w-[100px]"
                >
                  {isLoading ? 'Posting...' : 'Post'}
                </Button>
              </div>
            </div>

          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
