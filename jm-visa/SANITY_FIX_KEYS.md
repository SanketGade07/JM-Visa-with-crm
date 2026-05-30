// Run this script in Sanity Studio to fix missing keys
// Go to Vision tab in Sanity Studio and paste this query

// This will add missing _key values to all array items in all posts
import {v4 as uuidv4} from 'uuid'

export default {
  name: 'fix-missing-keys',
  title: 'Fix Missing Keys',
  type: 'document',
  
  // Run this as a migration
  async migrate(client) {
    const posts = await client.fetch('*[_type == "post"]')
    
    const patches = posts.map(post => {
      const body = post.body || []
      
      // Add _key to items that don't have it
      const fixedBody = body.map(item => {
        if (!item._key) {
          return {
            ...item,
            _key: uuidv4()
          }
        }
        return item
      })
      
      // Fix FAQs if they exist
      const faqs = post.faqs || []
      const fixedFaqs = faqs.map(faq => {
        if (!faq._key) {
          return {
            ...faq,
            _key: uuidv4()
          }
        }
        return faq
      })
      
      return client
        .patch(post._id)
        .set({ body: fixedBody, faqs: fixedFaqs })
        .commit()
    })
    
    return Promise.all(patches)
  }
}
