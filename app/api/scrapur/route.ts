// import { exec } from 'child_process';
// import { get } from 'http';
// import { EPOCH } from '@/app/consts';

// export function GET(request: Request) {
//   const lastWeek = getLastWeekNumber();
//   console.log(lastWeek);
//   return new Promise((resolve, reject) => {
//     exec(
//       `python3 app/api/scrapur/python/main.py ${lastWeek}`,
//       (error, stdout, stderr) => {
//         if (error) {
//           console.log(`error: ${error.message}`);
//           resolve(new Response('Error' + error.message, { status: 500 }));
//         } else if (stderr) {
//           console.log(`stderr: ${stderr}`);
//           resolve(new Response('Error' + stderr, { status: 500 }));
//         } else {
//           console.log(stdout);
//           resolve(new Response(stdout, { status: 200 }));
//         }
//       },
//     );
//   });
// }


// No longer using, after switching to github actinos