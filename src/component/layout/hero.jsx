import React from 'react';
import { Users, Calendar, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();
  const features = [
    {
      icon: Users,
      title: 'Consultations',
      description: 'One-on-one meetings with clients, prospects, or team members',
      color: 'text-blue-600'
    },
    {
      icon: Calendar,
      title: 'Interviews',
      description: 'Schedule job interviews and candidate screenings effortlessly',
      color: 'text-blue-600'
    },
    {
      icon: Clock,
      title: 'Services',
      description: 'Book appointments for coaching, therapy, tutoring, and more',
      color: 'text-blue-600'
    }
  ];

  const steps = [
    {
      number: '1',
      title: 'Create Account',
      description: 'Sign up for free in less than a minute'
    },
    {
      number: '2',
      title: 'Set Availability',
      description: 'Define your schedule and booking rules'
    },
    {
      number: '3',
      title: 'Share Your Link',
      description: 'Send your booking link to anyone'
    },
    {
      number: '4',
      title: 'Get Booked',
      description: 'Receive instant notifications for new bookings'
    }
  ];

  const testimonials = [
    {
      rating: 5,
      text: '"BookEasy has saved me hours every week. No more email ping-pong to find meeting times!"',
      name: 'Sarah Johnson',
      role: 'Marketing Consultant'
    },
    {
      rating: 5,
      text: '"My clients love how easy it is to book time with me. The interface is clean and intuitive."',
      name: 'Michael Chen',
      role: 'Career Coach'
    },
    {
      rating: 5,
      text: '"Simple, effective, and free! Exactly what I needed for my small business."',
      name: 'Emily Rodriguez',
      role: 'Freelance Designer'
    }
  ];

  const StarRating = ({ count }) => (
    <div className="flex gap-1 mb-3">
      {[...Array(count)].map((_, i) => (
        <svg key={i} className="w-5 h-5 fill-yellow-400" viewBox="0 0 20 20">
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      ))}
    </div>
  );

  return (
    <div className="w-full bg-white">

    <div className="">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 mt-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Book Your Appointment in Seconds
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Simplify scheduling and eliminate back-and-forth emails. Let your clients book time with you instantly.
          </p>
          <button
  onClick={() => navigate("/login")}
  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 inline-flex items-center gap-2 group"
>
  Schedule Now
  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
</button>

        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gray-50 ">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            What You Can Book
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl p-8 hover:shadow-xl hover:bg-white transition-all duration-300 border border-gray-100 group cursor-pointer"
              >
                <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                  <feature.icon className={`w-8 h-8 ${feature.color} group-hover:text-white transition-colors`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 bg-white ">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200" style={{ top: '3rem' }} />
            
            {steps.map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-blue-600 shadow-md hover:shadow-lg hover:scale-110 transition-all duration-300 border-4 border-white relative z-10">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 bg-gray-50 " >
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            What Our Users Say
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 hover:-translate-y-1"
              >
                <StarRating count={testimonial.rating} />
                <p className="text-gray-700 mb-6 leading-relaxed italic">
                  {testimonial.text}
                </p>
                <div className="border-t border-gray-100 pt-4">
                  <p className="font-bold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg md:text-xl text-gray-600 mb-10">
            Join thousands of professionals who schedule smarter
          </p>
          <button
  onClick={() => navigate("/signup")}
  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-10 py-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 inline-flex items-center gap-2 group"
>
  Start Free Today
  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
</button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm">© 2024 BookEasy. All rights reserved.</p>
        </div>
      </footer>
    </div>
    </div>
  );
}