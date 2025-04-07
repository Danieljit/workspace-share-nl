import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const teamMembers = [
  {
    name: "Sophia Chen",
    role: "Founder & CEO",
    bio: "Formerly leading workspace design at a major tech company, Sophia left after realizing she spent more time creating in cafés than in the spaces she designed.",
    quote: "The future of work isn't a place—it's a network of possibilities.",
    image: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg"
  },
  {
    name: "Marcus Williams",
    role: "CTO",
    bio: "A remote work advocate since before it was mainstream, Marcus built the technical foundation of our platform with distributed teams across three continents.",
    quote: "Technology should make human connections easier, not replace them.",
    image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg"
  },
  {
    name: "Leila Patel",
    role: "Head of Community",
    bio: "With background in urban planning and coworking management, Leila ensures our platform builds meaningful communities.",
    quote: "A desk is just furniture until you add the human element.",
    image: "https://images.pexels.com/photos/1181695/pexels-photo-1181695.jpeg"
  },
  {
    name: "David Okafor",
    role: "Chief Experience Officer",
    bio: "Former nomadic consultant who experienced firsthand the challenge of finding great workspaces on the go.",
    quote: "We're not disrupting work—we're humanizing it.",
    image: "https://images.pexels.com/photos/3778603/pexels-photo-3778603.jpeg"
  },
  {
    name: "Camila Rodriguez",
    role: "Growth & Partnerships",
    bio: "Started her career building community in the arts sector before joining our mission.",
    quote: "The most valuable business partnerships start with shared values, not just shared profits.",
    image: "https://images.pexels.com/photos/1181694/pexels-photo-1181694.jpeg"
  },
  {
    name: "Jamie Kim",
    role: "Operations & Host Success",
    bio: "Managed multiple coworking spaces before joining our team to empower hosts.",
    quote: "The best workspace experiences happen when hosts feel like partners, not just providers.",
    image: "https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg"
  }
]

export default function AboutPage() {
  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      {/* Hero Section */}
      <div className="relative rounded-xl overflow-hidden mb-16 h-[400px]">
        <Image 
          src="https://images.pexels.com/photos/7070/space-desk-workspace-coworking.jpg" 
          alt="Workspace community" 
          fill 
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50 flex items-center">
          <div className="text-white max-w-2xl mx-auto text-center px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About Us</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              We're reimagining how and where people work by connecting underutilized spaces with professionals seeking flexibility.
            </p>
          </div>
        </div>
      </div>

      {/* Our Story Section */}
      <section className="mb-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-2">Our Story</h2>
            <h3 className="text-xl text-primary mb-6">Where Work Meets Freedom</h3>
            <p className="mb-4">
              What began as a simple question—"Why are so many desks sitting empty?"—has evolved into a movement reimagining how and where we work.
            </p>
            <p className="mb-4">
              We saw two problems colliding: professionals craving flexibility beyond the binary choice of "home vs. office," and businesses watching valuable workspace sit unused. The solution wasn't just a marketplace; it was a new work culture waiting to happen.
            </p>
          </div>
          <div className="relative h-80 rounded-lg overflow-hidden shadow-xl">
            <Image 
              src="https://images.pexels.com/photos/3182834/pexels-photo-3182834.jpeg" 
              alt="Team collaboration" 
              fill 
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="mb-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 relative h-80 rounded-lg overflow-hidden shadow-xl">
            <Image 
              src="https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg" 
              alt="People working together" 
              fill 
              className="object-cover"
            />
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-3xl font-bold mb-2">Our Mission</h2>
            <h3 className="text-xl text-primary mb-6">Connecting Spaces, People, and Possibilities</h3>
            <p className="mb-4">
              We're creating a world where work happens in the right space at the right time. By unlocking underutilized workspaces, we're building communities where professionals can find not just a desk, but inspiration, connection, and freedom.
            </p>
            <p className="mb-4">
              Our platform transforms empty desks into opportunities—for hosts to offset costs, for professionals to escape isolation, and for ideas to collide in unexpected ways.
            </p>
          </div>
        </div>
      </section>

      {/* Our Vision Section */}
      <section className="mb-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-2">Our Vision</h2>
            <h3 className="text-xl text-primary mb-6">Freedom to Work on Your Terms</h3>
            <p className="mb-4">
              We envision a future where your workspace adapts to your needs, not the other way around. Where professionals can seamlessly flow between focused solitude and collaborative energy. Where the boundaries between industries blur as lawyers, designers, developers, and marketers share coffee and perspectives.
            </p>
            <p className="mb-4">
              This isn't just about booking a desk—it's about creating a fluid, human-centered work experience that respects both productivity and well-being.
            </p>
          </div>
          <div className="relative h-80 rounded-lg overflow-hidden shadow-xl">
            <Image 
              src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg" 
              alt="Collaborative workspace" 
              fill 
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold mb-10 text-center">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-background p-8 rounded-lg border shadow-sm">
            <h3 className="text-xl font-bold mb-3">Freedom</h3>
            <p>Work should adapt to your life, not consume it.</p>
          </div>
          <div className="bg-background p-8 rounded-lg border shadow-sm">
            <h3 className="text-xl font-bold mb-3">Connection</h3>
            <p>The best ideas happen when diverse minds meet.</p>
          </div>
          <div className="bg-background p-8 rounded-lg border shadow-sm">
            <h3 className="text-xl font-bold mb-3">Empowerment</h3>
            <p>Everyone deserves the workspace that brings out their best.</p>
          </div>
          <div className="bg-background p-8 rounded-lg border shadow-sm">
            <h3 className="text-xl font-bold mb-3">Sustainability</h3>
            <p>Using what already exists creates economic and environmental value.</p>
          </div>
          <div className="bg-background p-8 rounded-lg border shadow-sm">
            <h3 className="text-xl font-bold mb-3">Trust</h3>
            <p>Our community thrives on reliability, safety, and respect.</p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold mb-10 text-center">Meet the Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <div key={index} className="bg-background rounded-lg border shadow-sm overflow-hidden">
              <div className="h-64 relative">
                <Image 
                  src={member.image} 
                  alt={member.name} 
                  fill 
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold">{member.name}</h3>
                <p className="text-primary mb-3">{member.role}</p>
                <p className="mb-3">{member.bio}</p>
                <p className="italic">"{member.quote}"</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Join Our Movement Section */}
      <section className="relative mb-20 py-16 rounded-xl overflow-hidden">
        <Image 
          src="https://images.pexels.com/photos/3184306/pexels-photo-3184306.jpeg" 
          alt="Collaborative workspace" 
          fill 
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50"></div>
        <div className="relative text-center text-white max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6">Join Our Movement</h2>
          <div>
            <p className="mb-6">
              Whether you're listing your first desk or finding your tenth workspace, you're part of something bigger—a community redefining what work can be.
            </p>
            <p className="mb-6">
              The future of work isn't returning to normal. It's creating something better.
            </p>
            <p className="mb-8">
              Freedom to work differently. Freedom to connect meaningfully. Freedom to thrive on your terms.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/test/list/form">
                <Button size="lg" className="bg-white text-black hover:bg-white/90">List Your Space</Button>
              </Link>
              <Link href="/spaces">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">Find a Workspace</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
