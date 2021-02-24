<div class='tooltip' tooltip='{if $list_id}{$screen_name}/{$name}{else}{$screen_name}{/if}' screen_name='{$screen_name}' user_id='{$user_id}' account_id='{$account_id}' type='{$type}' drag_id='{$drag_id}' {if $list_id}list_id='{$list_id}' slug='{$slug}' name='{$name}' owner_screen_name='{$owner_screen_name}'{/if}>
	<span><img src='{$icon}'></span>
	{if $list_id}
	<div class='listicon icon-list'></div>
	{/if}
</div>
