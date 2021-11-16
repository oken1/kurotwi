<div>
{if $video}
<video preload='metadata' poster='{$poster}' controls playsinline>
	{foreach item=item from=$items}
		<source src='{$item->url}' type='{$item->contenttype}'>
	{/foreach}
</video>
{else}
<img class='image' src='{$url}'>
{/if}
</div>
<div class='imgbtns'>
<div class='resizebtn img_panelsize icon-expand tooltip' tooltip='(i18n_0113)'></div>
<div class='resizebtn img_fullsize icon-resize tooltip' tooltip='(i18n_0229)'></div>
<div class='resizebtn img_udreverse icon-udrev tooltip' tooltip='(i18n_0311)'></div>
<div class='resizebtn img_lrreverse icon-lrrev tooltip' tooltip='(i18n_0312)'></div>
<div class='resizebtn img_rotate icon-redo tooltip' tooltip='(i18n_0313)'></div>
</div>
