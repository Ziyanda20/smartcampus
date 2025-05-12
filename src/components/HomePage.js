import { GraduationCap, Calendar, Clock, Wrench, BellRing } from 'lucide-react';

export default function HomePage({ user }) {
  return (
    <div className="container py-5">
      {/* Hero Section */}
      <section className="text-center py-5">
        <h1 className="display-4 fw-bold">Welcome to Smart Campus Services Portal</h1>
        <p className="lead text-muted">
          Your one-stop platform for campus resources, scheduling, and services.
        </p>

        {/* Campus Image Placeholder */}
        <div className="position-relative my-5 bg-primary text-white rounded shadow overflow-hidden">
          <div className="p-5 text-center">
            <GraduationCap size={60} className="mb-3" />
            <h2 className="h3">Smart Campus Services</h2>
            <p className="lead">Simplifying Campus Life</p>
          </div>
        </div>

        {/* About Paragraph */}
        <div className="mx-auto" style={{ maxWidth: "800px" }}>
          <p className="fs-5 text-secondary">
            The Smart Campus Services Portal simplifies campus life by providing a centralized system
            for students, lecturers, and administrators to efficiently manage resources. Book study rooms,
            view class schedules, report maintenance issues, and stay updated with important announcements—
            all in one secure platform.
          </p>
        </div>

        {!user && (
          <div className="mt-4">
            <a href="/login" className="btn btn-primary btn-lg">Get Started</a>
          </div>
        )}
      </section>

      {/* Services */}
      <section className="py-5 bg-light rounded">
        <div className="row g-4">
          {[
            {
              icon: <Calendar size={40} className="mb-2 text-primary" />,
              title: "Room Bookings",
              desc: "Reserve classrooms, labs, and meeting spaces.",
            },
            {
              icon: <Clock size={40} className="mb-2 text-primary" />,
              title: "Class Schedule",
              desc: "View your timetable and class information.",
            },
            {
              icon: <Wrench size={40} className="mb-2 text-primary" />,
              title: "Maintenance",
              desc: "Submit and track maintenance requests.",
            },
            {
              icon: <BellRing size={40} className="mb-2 text-primary" />,
              title: "Announcements",
              desc: "Stay updated with campus news and alerts.",
            },
          ].map(({ icon, title, desc }, i) => (
            <div key={i} className="col-sm-6 col-lg-3">
              <div className="card h-100 shadow-sm">
                <div className="card-body text-center">
                  {icon}
                  <h5 className="card-title">{title}</h5>
                  <p className="card-text text-muted">{desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      {!user && (
        <section className="text-center py-5">
          <h2 className="fw-bold mb-3">Ready to Get Started?</h2>
          <p className="text-muted mb-4 fs-5">Sign in to access all campus services and resources.</p>
          <a href="/login" className="btn btn-primary btn-lg">Sign In Now</a>
        </section>
      )}
    </div>
  );
}
