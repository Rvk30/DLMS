import { PrismaClient, Role, BookCategory, BookStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding DLMS database...\n');

    // ── 1. Create Librarian ──────────────────────────────────────────────────
    const librarianPassword = await bcrypt.hash('Librarian@123', 12);

    const librarianUser = await prisma.user.upsert({
        where: { email: 'librarian@dlms.edu' },
        update: {},
        create: {
            name: 'Dr. Priya Sharma',
            email: 'librarian@dlms.edu',
            password: librarianPassword,
            role: Role.LIBRARIAN,
            phone: '+91-9876543210',
            isEmailVerified: true,
            librarian: {
                create: {
                    employeeId: 'LIB-001',
                    department: 'Central Library',
                },
            },
        },
    });
    console.log(`✅ Librarian created: ${librarianUser.email}`);

    // ── 2. Create Students ────────────────────────────────────────────────────
    const studentPassword = await bcrypt.hash('Student@123', 12);

    const student1User = await prisma.user.upsert({
        where: { email: 'arjun.kumar@dlms.edu' },
        update: {},
        create: {
            name: 'Arjun Kumar',
            email: 'arjun.kumar@dlms.edu',
            password: studentPassword,
            role: Role.STUDENT,
            phone: '+91-9123456789',
            isEmailVerified: true,
            student: {
                create: {
                    studentId: 'STU-2024-001',
                    className: 'B.Tech CSE – 3rd Year',
                    department: 'Computer Science & Engineering',
                    semester: 6,
                    account: {
                        create: {},
                    },
                },
            },
        },
    });
    console.log(`✅ Student created: ${student1User.email}`);

    const student2User = await prisma.user.upsert({
        where: { email: 'sneha.patel@dlms.edu' },
        update: {},
        create: {
            name: 'Sneha Patel',
            email: 'sneha.patel@dlms.edu',
            password: studentPassword,
            role: Role.STUDENT,
            isEmailVerified: true,
            student: {
                create: {
                    studentId: 'STU-2024-002',
                    className: 'B.Sc Physics – 2nd Year',
                    department: 'Physics',
                    semester: 4,
                    account: {
                        create: {},
                    },
                },
            },
        },
    });
    console.log(`✅ Student created: ${student2User.email}`);

    // ── 3. Seed Books ──────────────────────────────────────────────────────────
    const books = [
        {
            isbn: '978-0-13-110362-7',
            title: 'The C Programming Language',
            author: 'Brian W. Kernighan, Dennis M. Ritchie',
            publisher: 'Prentice Hall',
            publicationYear: 1988,
            edition: '2nd',
            category: BookCategory.TECHNOLOGY,
            totalCopies: 5,
            availableCopies: 4,
            description: 'Classic reference for C programming language.',
        },
        {
            isbn: '978-0-13-468599-1',
            title: 'Clean Code',
            author: 'Robert C. Martin',
            publisher: 'Prentice Hall',
            publicationYear: 2008,
            edition: '1st',
            category: BookCategory.TECHNOLOGY,
            totalCopies: 3,
            availableCopies: 3,
            description: 'A Handbook of Agile Software Craftsmanship.',
        },
        {
            isbn: '978-0-06-112008-4',
            title: 'To Kill a Mockingbird',
            author: 'Harper Lee',
            publisher: 'HarperCollins',
            publicationYear: 1960,
            edition: '1st',
            category: BookCategory.FICTION,
            totalCopies: 4,
            availableCopies: 4,
        },
        {
            isbn: '978-0-14-028329-7',
            title: 'A Brief History of Time',
            author: 'Stephen Hawking',
            publisher: 'Bantam Books',
            publicationYear: 1988,
            category: BookCategory.SCIENCE,
            totalCopies: 3,
            availableCopies: 3,
            description: 'Landmark volume in modern science writing.',
        },
        {
            isbn: '978-0-13-235088-4',
            title: 'Introduction to Algorithms',
            author: 'Thomas H. Cormen et al.',
            publisher: 'MIT Press',
            publicationYear: 2009,
            edition: '3rd',
            category: BookCategory.MATHEMATICS,
            totalCopies: 6,
            availableCopies: 5,
            description: 'Comprehensive text on algorithms (CLRS).',
        },
        {
            isbn: '978-0-7432-7356-5',
            title: 'The Great Gatsby',
            author: 'F. Scott Fitzgerald',
            publisher: 'Scribner',
            publicationYear: 1925,
            category: BookCategory.LITERATURE,
            totalCopies: 2,
            availableCopies: 2,
        },
        {
            isbn: '978-0-375-70943-1',
            title: 'Sapiens: A Brief History of Humankind',
            author: 'Yuval Noah Harari',
            publisher: 'Harper Perennial',
            publicationYear: 2015,
            category: BookCategory.HISTORY,
            totalCopies: 4,
            availableCopies: 4,
            description: 'Explores the history of human civilization.',
        },
        {
            isbn: '978-0-13-110521-8',
            title: 'Database System Concepts',
            author: 'Abraham Silberschatz et al.',
            publisher: 'McGraw-Hill',
            publicationYear: 2019,
            edition: '7th',
            category: BookCategory.TECHNOLOGY,
            totalCopies: 4,
            availableCopies: 3,
            description: 'Standard textbook for database management systems.',
        },
    ];

    for (const book of books) {
        await prisma.book.upsert({
            where: { isbn: book.isbn },
            update: {},
            create: { ...book, status: BookStatus.AVAILABLE },
        });
    }
    console.log(`✅ ${books.length} books seeded`);

    console.log('\n🎉 Database seeded successfully!\n');
    console.log('🔑 Default credentials:');
    console.log('   Librarian → librarian@dlms.edu / Librarian@123');
    console.log('   Student 1 → arjun.kumar@dlms.edu / Student@123');
    console.log('   Student 2 → sneha.patel@dlms.edu / Student@123');
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
