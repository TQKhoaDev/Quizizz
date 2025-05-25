// import { PrismaClient } from '@prisma/client';
// import * as bcrypt from 'bcryptjs';
// import { UserRole, QuestionType, QuestionDifficulty, SessionStatus } from './enums';

// const prisma = new PrismaClient();

// async function main() {
//   try {
//     console.log('🧹 Đang xóa dữ liệu cũ...');
    
//     // Xóa dữ liệu cũ (nếu có)
//     await prisma.$transaction([
//       prisma.answer.deleteMany(),
//       prisma.participant.deleteMany(),
//       prisma.questionOption.deleteMany(),
//       prisma.quizQuestion.deleteMany(),
//       prisma.quizSession.deleteMany(),
//       prisma.quiz.deleteMany(),
//       prisma.user.deleteMany()
//     ]);

//     console.log('🧹 Đã xóa dữ liệu cũ');

//     // 1. Tạo người dùng mẫu
//     const adminPassword = await bcrypt.hash('admin123', 10);
//     const proctorPassword = await bcrypt.hash('proctor123', 10);
//     const studentPassword = await bcrypt.hash('student123', 10);

//     const admin = await prisma.user.create({
//       data: {
//         email: 'admin@quizizz.com',
//         password: adminPassword,
//         fullName: 'Admin User',
//         role: 'ADMIN',
//       },
//     });

//     const proctor = await prisma.user.create({
//       data: {
//         email: 'proctor@quizizz.com',
//         password: proctorPassword,
//         fullName: 'Proctor User',
//         role: 'PROCTOR',
//       },
//     });

//     const student1 = await prisma.user.create({
//       data: {
//         email: 'student1@quizizz.com',
//         password: studentPassword,
//         fullName: 'Student One',
//         role: 'STUDENT',
//       },
//     });

//     const student2 = await prisma.user.create({
//       data: {
//         email: 'student2@quizizz.com',
//         password: studentPassword,
//         fullName: 'Student Two',
//         role: 'STUDENT',
//       },
//     });

//     console.log('👥 Đã tạo người dùng mẫu');

//     // 2. Tạo quiz mẫu
//     const quiz1 = await prisma.quiz.create({
//       data: {
//         title: 'Kiến thức lập trình cơ bản',
//         description: 'Kiểm tra kiến thức về lập trình cơ bản và thuật toán',
//         timeLimit: 600, // 10 phút
//         isPublic: true,
//         code: 'CODE101',
//         creator: {
//           connect: {
//             id: proctor.id
//           }
//         }
//       },
//     });

//     const quiz2 = await prisma.quiz.create({
//       data: {
//         title: 'Toán học THPT',
//         description: 'Bài kiểm tra toán học dành cho học sinh THPT',
//         timeLimit: 1200, // 20 phút
//         isPublic: true,
//         code: 'MATH102',
//         creator: {
//           connect: {
//             id: proctor.id
//           }
//         }
//       },
//     });

//     console.log('📝 Đã tạo quiz mẫu');

//     // 3. Tạo câu hỏi và đáp án cho Quiz 1
//     // Câu hỏi 1: MCQ
//     const q1 = await prisma.quizQuestion.create({
//       data: {
//         content: 'Ngôn ngữ lập trình nào được sử dụng để phát triển ứng dụng iOS?',
//         type: 'MCQ',
//         timeLimit: 30,
//         points: 1,
//         difficulty: 'EASY',
//         order: 1,
//         quiz: {
//           connect: {
//             id: quiz1.id
//           }
//         },
//         options: {
//           create: [
//             {
//               content: 'Java',
//               isCorrect: false,
//               order: 1,
//             },
//             {
//               content: 'Swift',
//               isCorrect: true,
//               order: 2,
//             },
//             {
//               content: 'C#',
//               isCorrect: false,
//               order: 3,
//             },
//             {
//               content: 'Python',
//               isCorrect: false,
//               order: 4,
//             },
//           ],
//         },
//       },
//     });

//     // Câu hỏi 2: TRUE_FALSE
//     const q2 = await prisma.quizQuestion.create({
//       data: {
//         content: 'JavaScript là ngôn ngữ lập trình có kiểu tĩnh (statically typed)?',
//         type: 'TRUE_FALSE',
//         timeLimit: 20,
//         points: 1,
//         difficulty: 'EASY',
//         order: 2,
//         quiz: {
//           connect: {
//             id: quiz1.id
//           }
//         },
//         options: {
//           create: [
//             {
//               content: 'Đúng',
//               isCorrect: false,
//               order: 1,
//             },
//             {
//               content: 'Sai',
//               isCorrect: true,
//               order: 2,
//             },
//           ],
//         },
//       },
//     });

//     // Câu hỏi 3: MULTIPLE_SELECT
//     const q3 = await prisma.quizQuestion.create({
//       data: {
//         content: 'Ngôn ngữ lập trình nào thuộc nhóm ngôn ngữ biên dịch (compiled language)?',
//         type: 'MULTIPLE_SELECT',
//         timeLimit: 40,
//         points: 2,
//         difficulty: 'MEDIUM',
//         order: 3,
//         quiz: {
//           connect: {
//             id: quiz1.id
//           }
//         },
//         options: {
//           create: [
//             {
//               content: 'Java',
//               isCorrect: true,
//               order: 1,
//             },
//             {
//               content: 'Python',
//               isCorrect: false,
//               order: 2,
//             },
//             {
//               content: 'C++',
//               isCorrect: true,
//               order: 3,
//             },
//             {
//               content: 'JavaScript',
//               isCorrect: false,
//               order: 4,
//             },
//             {
//               content: 'Go',
//               isCorrect: true,
//               order: 5,
//             },
//           ],
//         },
//       },
//     });

//     // Câu hỏi 4: MATCHING
//     const q4 = await prisma.quizQuestion.create({
//       data: {
//         content: 'Ghép các ngôn ngữ lập trình với công ty phát triển tương ứng:',
//         type: 'MATCHING',
//         timeLimit: 60,
//         points: 3,
//         difficulty: 'HARD',
//         order: 4,
//         quiz: {
//           connect: {
//             id: quiz1.id
//           }
//         },
//         options: {
//           create: [
//             {
//               content: 'Swift',
//               matchingText: 'Apple',
//               isCorrect: true,
//               order: 1,
//             },
//             {
//               content: 'C#',
//               matchingText: 'Microsoft',
//               isCorrect: true,
//               order: 2,
//             },
//             {
//               content: 'Go',
//               matchingText: 'Google',
//               isCorrect: true,
//               order: 3,
//             },
//             {
//               content: 'Java',
//               matchingText: 'Oracle',
//               isCorrect: true,
//               order: 4,
//             },
//           ],
//         },
//       },
//     });

//     // 4. Tạo câu hỏi và đáp án cho Quiz 2
//     // Câu hỏi 1: MCQ
//     const q5 = await prisma.quizQuestion.create({
//       data: {
//         content: 'Giá trị của sin(π/2) là bao nhiêu?',
//         type: 'MCQ',
//         timeLimit: 30,
//         points: 1,
//         difficulty: 'EASY',
//         order: 1,
//         quiz: {
//           connect: {
//             id: quiz2.id
//           }
//         },
//         options: {
//           create: [
//             {
//               content: '0',
//               isCorrect: false,
//               order: 1,
//             },
//             {
//               content: '1',
//               isCorrect: true,
//               order: 2,
//             },
//             {
//               content: '-1',
//               isCorrect: false,
//               order: 3,
//             },
//             {
//               content: '2',
//               isCorrect: false,
//               order: 4,
//             },
//           ],
//         },
//       },
//     });

//     // Câu hỏi 2: TRUE_FALSE
//     const q6 = await prisma.quizQuestion.create({
//       data: {
//         content: 'Phương trình x² + 1 = 0 có nghiệm trong tập số thực?',
//         type: 'TRUE_FALSE',
//         timeLimit: 20,
//         points: 1,
//         difficulty: 'EASY',
//         order: 2,
//         quiz: {
//           connect: {
//             id: quiz2.id
//           }
//         },
//         options: {
//           create: [
//             {
//               content: 'Đúng',
//               isCorrect: false,
//               order: 1,
//             },
//             {
//               content: 'Sai',
//               isCorrect: true,
//               order: 2,
//             },
//           ],
//         },
//       },
//     });

//     console.log('❓ Đã tạo câu hỏi mẫu');

//     // 5. Tạo phiên kiểm tra mẫu
//     const session1 = await prisma.quizSession.create({
//       data: {
//         status: 'ACTIVE',
//         startTime: new Date(),
//         code: 'SESSION1',
//         quiz: {
//           connect: {
//             id: quiz1.id
//           }
//         },
//         proctor: {
//           connect: {
//             id: proctor.id
//           }
//         }
//       },
//     });

//     console.log('🎮 Đã tạo phiên kiểm tra mẫu');

//     // 6. Tạo người tham gia
//     const participant1 = await prisma.participant.create({
//       data: {
//         user: {
//           connect: {
//             id: student1.id
//           }
//         },
//         session: {
//           connect: {
//             id: session1.id
//           }
//         },
//         score: 0,
//       },
//     });

//     const participant2 = await prisma.participant.create({
//       data: {
//         user: {
//           connect: {
//             id: student2.id
//           }
//         },
//         session: {
//           connect: {
//             id: session1.id
//           }
//         },
//         score: 0,
//       },
//     });

//     console.log('👨‍🎓 Đã tạo người tham gia mẫu');

//     // 7. Tạo câu trả lời mẫu cho học sinh 1
//     // Lấy các options
//     const q1Options = await prisma.questionOption.findMany({
//       where: { questionId: q1.id },
//     });

//     const q2Options = await prisma.questionOption.findMany({
//       where: { questionId: q2.id },
//     });

//     // Tạo câu trả lời
//     const answer1 = await prisma.answer.create({
//       data: {
//         participant: {
//           connect: {
//             id: participant1.id
//           }
//         },
//         question: {
//           connect: {
//             id: q1.id
//           }
//         },
//         option: {
//           connect: {
//             id: q1Options[1].id // Chọn đáp án đúng (Swift)
//           }
//         },
//         isCorrect: true,
//         points: 1,
//         responseTime: 15000, // 15 giây
//       },
//     });

//     const answer2 = await prisma.answer.create({
//       data: {
//         participant: {
//           connect: {
//             id: participant1.id
//           }
//         },
//         question: {
//           connect: {
//             id: q2.id
//           }
//         },
//         option: {
//           connect: {
//             id: q2Options[1].id // Chọn đáp án đúng (Sai)
//           }
//         },
//         isCorrect: true,
//         points: 1,
//         responseTime: 10000, // 10 giây
//       },
//     });

//     // Cập nhật điểm cho participant1
//     await prisma.participant.update({
//       where: { id: participant1.id },
//       data: { score: 2 }, // Tổng điểm: 1 + 1 = 2
//     });

//     console.log('✅ Đã tạo câu trả lời mẫu');
    
//     console.log('✨ Hoàn tất tạo dữ liệu mẫu!');
//   } catch (error) {
//     console.error('Lỗi trong quá trình tạo dữ liệu mẫu:', error);
//   }
// }

// main()
//   .catch((e) => {
//     console.error('Lỗi khi tạo dữ liệu mẫu:', e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   }); 