<div class='tweet_quote'>
	<div class='headcontainer'>
		<div class='namedate'>
			<img src='{$icon}'>
			{if $namedisp==0}
				<span class='atmark ndr'>@</span><span class='screen_name ndr'>{$screen_name}</span> {if $name}<span class='name ndr'>{$name}</span>{/if}
			{else}
				{if $name}<span class='name drc'>{$name}</span>{/if}<span class='atmark drc'> @</span><span class='screen_name drc'>{$screen_name}</span>
			{/if}
			<br>
		</div>
	</div>

	<div class='tweet_quote_text'>{$text}</div>
	<div>
		{foreach item=media_file from=$media}
			<img class='thumb' src='{$media_file}'>
		{/foreach}
	</div>
</div>
