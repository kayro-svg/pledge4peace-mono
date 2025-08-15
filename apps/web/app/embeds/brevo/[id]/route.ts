import { getClient } from "@/lib/sanity/client";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  const form = await getClient().fetch(
    `*[_type == "brevoForm" && (slug.current == $id || _id == $id)][0]{ html, height }`,
    { id }
  );

  if (!form?.html) {
    return new Response("Form not found", { status: 404 });
  }

  const htmlDoc = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="stylesheet" href="https://sibforms.com/forms/end-form/build/sib-styles.css">
  <style>
    html,body{margin:0;padding:0;background:transparent}
    /* Quitar fondos grises, mantener el borde del formulario */
    .sib-form{background:transparent !important;}
    #sib-container,
    .sib-container--large.sib-container--vertical{
      background:transparent !important;
    }
  </style>
</head>
<body>
${form.html}
<script>
window.REQUIRED_CODE_ERROR_MESSAGE='Please choose a country code';
window.LOCALE='en';
window.EMAIL_INVALID_MESSAGE=window.SMS_INVALID_MESSAGE="The information provided is invalid. Please review the field format and try again.";
window.REQUIRED_ERROR_MESSAGE="This field cannot be left blank. ";
window.GENERIC_INVALID_MESSAGE="The information provided is invalid. Please review the field format and try again.";
window.INVALID_NUMBER="The information provided is invalid. Please review the field format and try again.";
window.translation={common:{selectedList:'{quantity} list selected',selectedLists:'{quantity} lists selected',selectedOption:'{quantity} selected',selectedOptions:'{quantity} selected'}};
var AUTOHIDE=Boolean(0);
// Auto-resize: observar cambios de tamaño y avisar al padre
function postHeight(){
  var h = document.body.scrollHeight;
  try{ parent.postMessage({ type: 'brevoFormHeight', id: '${id}', height: h }, '*'); }catch(e){}
}
var ro = new ResizeObserver(postHeight); ro.observe(document.body);
window.addEventListener('load', postHeight);
setInterval(postHeight, 1000);
</script>
<script defer src="https://sibforms.com/forms/end-form/build/main.js"></script>
</body>
</html>`;

  return new Response(htmlDoc, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=300",
    },
  });
}
