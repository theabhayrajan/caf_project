"use client";

const assessments = [
  {
    id: 1,
    color: "border-blue-500 text-blue-500",
    title: "Enhancing Self-Awareness and Emotional Intelligence",
    description:
      "Our assessments are thoughtfully designed to support the holistic development of school children by focusing on their psychological, social, and environmental conduct. These evaluations provide valuable insights into a child’s emotional well-being, interpersonal skills, and awareness of their surroundings, empowering them to grow into well-rounded individuals. Here’s how our assessments can make a meaningful impact:",
  },
  {
    id: 2,
    color: "border-purple-500 text-purple-500",
    title: "Improving Social Skills and Empathy",
    description:
      "Through scenario-based questions and interactive activities, we assess a child’s ability to empathize, cooperate, and resolve conflicts. These insights equip children with the tools to navigate social situations effectively, fostering kindness, teamwork, and leadership.",
  },
  {
    id: 3,
    color: "border-pink-500 text-pink-500",
    title: "Promoting Environmental Responsibility",
    description:
      "Our environmental conduct assessments educate children about sustainability and global citizenship. By evaluating their habits and attitudes toward the environment, we inspire eco-friendly practices and a sense of responsibility toward the planet.",
  },
  {
    id: 4,
    color: "border-yellow-500 text-yellow-500",
    title: "Identifying Strengths and Areas for Growth",
    description:
      "The assessments provide a clear picture of each child’s strengths and areas that need improvement. This personalized feedback helps parents, teachers, and students create targeted strategies to address specific needs, ensuring balanced growth.",
  },
  {
    id: 5,
    color: "border-green-500 text-green-500",
    title: "Tracking Progress Over Time",
    description:
      "With regular assessments, schools and families can monitor a child’s development journey through the Holistic Development Index (HDI). This progress tracking ensures timely interventions and celebrates milestones, motivating children to continue improving.",
  },
  {
    id: 6,
    color: "border-teal-500 text-teal-500",
    title: "Supporting Personalized Learning",
    description:
      "Based on assessment results, children receive tailored recommendations, such as mindfulness exercises, educational resources, or social skill-building activities. This individualized approach enhances learning outcomes and nurtures lifelong skills.",
  },
];

export default function CAFHelpSection() {
  return (
    <section className="bg-white px-6 sm:px-10 md:px-16 lg:px-24 py-12">
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 text-center md:text-left">
        How the CAF’s assessments would help the students
      </h2>

      <p className="text-gray-700 mb-10 text-sm sm:text-base md:text-lg leading-relaxed max-w-4xl mx-auto md:mx-0">
        Our assessments are thoughtfully designed to support the holistic development of school children by focusing on their psychological, social, and environmental conduct. These evaluations provide valuable insights into a child’s emotional well-being, interpersonal skills, and awareness of their surroundings, empowering them to grow into well-rounded individuals. Here’s how our assessments can make a meaningful impact:
      </p>

      {/* Cards section shifted right */}
      <div className="space-y-8 pl-4 sm:pl-6 md:pl-10">
        {assessments.map((item) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row items-start gap-4"
          >
            {/* Number box */}
            <div
              className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-md border-2 font-semibold ${item.color} flex-shrink-0`}
            >
              {item.id}
            </div>

            {/* Text content */}
            <div className="flex flex-col">
              <h3 className="font-semibold text-gray-900 text-base sm:text-lg mb-1">
                {item.title}
              </h3>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
